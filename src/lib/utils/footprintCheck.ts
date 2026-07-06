import type {
	CountrySustainability,
	ExposureTier,
	MarketKey,
	RegulationKey
} from '$lib/types/sustainability';
import type { ProductCategory } from '$lib/data/productCategories';
import { blendedCost, blendedRisk } from '$lib/utils/marketRisk';

export interface FootprintEstimate {
	carbonPerTon: number;
	waterPerKg: number;
	/** % above (+) or below (−) the clean-sourcing benchmark */
	carbonVsCleanPct: number;
	waterVsCleanPct: number;
	riskScore: number;
	riskTier: ExposureTier;
	/** Directional sourcing cost index, 0–100 for the selected markets */
	costIndex: number;
	/** % above (+) or below (−) the dataset median cost for those markets */
	costVsMedianPct: number;
	avgLaborCostUsd: number;
	/** The regulations most triggered by this mix in the selected markets (may be empty) */
	topRegulations: { key: RegulationKey; reason: string }[];
	/** Selected country contributing most to compliance risk */
	biggestLever: CountrySustainability;
}

const quantile = (sorted: number[], q: number): number => {
	const pos = (sorted.length - 1) * q;
	const lo = Math.floor(pos);
	const hi = Math.ceil(pos);
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

const asc = (values: number[]): number[] => [...values].sort((a, b) => a - b);

const TIER_RANK: Record<ExposureTier, number> = { low: 0, medium: 1, high: 2 };

type TierKey = 'cbamExposure' | 'csrdExposure' | 'eprExposure' | 'uflpaExposure';

function dominantTier(countries: CountrySustainability[], key: TierKey): ExposureTier {
	let worst: ExposureTier = 'low';
	for (const c of countries) {
		if (TIER_RANK[c[key]] > TIER_RANK[worst]) worst = c[key];
	}
	return worst;
}

export function estimateFootprint(
	selected: CountrySustainability[],
	category: ProductCategory,
	markets: MarketKey[],
	all: CountrySustainability[]
): FootprintEstimate {
	const mean = (fn: (c: CountrySustainability) => number) =>
		selected.reduce((sum, c) => sum + fn(c), 0) / selected.length;

	const cleanCarbon = quantile(asc(all.map((c) => c.carbonPerTon)), 0.25);
	const cleanWater = quantile(asc(all.map((c) => c.waterPerKg)), 0.25);
	const medianCost = quantile(asc(all.map((c) => blendedCost(c, markets))), 0.5);

	const carbonPerTon = Math.round(mean((c) => c.carbonPerTon) * category.energyFactor);
	const waterPerKg = Math.round(mean((c) => c.waterPerKg) * category.waterFactor);
	const costIndex = Math.round(mean((c) => blendedCost(c, markets)));
	const avgLaborCostUsd = Math.round(mean((c) => c.laborCostUsd));

	// DPP urgency only bites where ESPR applies (EU); halve it if EU isn't a selling market
	const dppBump = markets.includes('eu') ? category.dppUrgency : Math.round(category.dppUrgency / 2);
	const riskScore = Math.min(100, Math.round(mean((c) => blendedRisk(c, markets)) + dppBump));
	const riskTier: ExposureTier = riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

	const candidates: { key: RegulationKey; weight: number; reason: string }[] = [];
	if (markets.includes('eu')) {
		candidates.push(
			{
				key: 'csrd',
				weight: TIER_RANK[dominantTier(selected, 'csrdExposure')] * 30 + 3,
				reason: 'EU buyers will require value-chain emissions and social data from this sourcing mix.'
			},
			{
				key: 'epr',
				weight: TIER_RANK[dominantTier(selected, 'eprExposure')] * 30 + 2,
				reason: 'Products sold into the EU face eco-modulated Extended Producer Responsibility fees.'
			},
			{
				key: 'cbam',
				weight: TIER_RANK[dominantTier(selected, 'cbamExposure')] * 30 + 1,
				reason: 'Energy-intensive production in this mix is exposed if CBAM extends to textiles.'
			},
			{
				key: 'dpp',
				weight: (100 - Math.min(...selected.map((c) => c.dppReadiness))) * 0.6 + category.dppUrgency,
				reason: 'Traceability gaps in this mix will complicate Digital Product Passport compliance.'
			}
		);
	}
	if (markets.includes('us')) {
		candidates.push({
			key: 'uflpa',
			weight: TIER_RANK[dominantTier(selected, 'uflpaExposure')] * 34 + 4,
			reason:
				'US Customs can detain shipments with Xinjiang-linked inputs — the documentation burden falls on the importer.'
		});
	}
	candidates.sort((a, b) => b.weight - a.weight);

	const biggestLever = selected.reduce((worst, c) =>
		blendedRisk(c, markets) > blendedRisk(worst, markets) ? c : worst
	);

	return {
		carbonPerTon,
		waterPerKg,
		carbonVsCleanPct: Math.round(((carbonPerTon - cleanCarbon) / cleanCarbon) * 100),
		waterVsCleanPct: Math.round(((waterPerKg - cleanWater) / cleanWater) * 100),
		riskScore,
		riskTier,
		costIndex,
		costVsMedianPct: Math.round(((costIndex - medianCost) / medianCost) * 100),
		avgLaborCostUsd,
		topRegulations: candidates.slice(0, 2).map(({ key, reason }) => ({ key, reason })),
		biggestLever
	};
}
