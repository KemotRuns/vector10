import type { CountrySustainability, ExposureTier, RegulationKey } from '$lib/types/sustainability';
import type { ProductCategory } from '$lib/data/productCategories';

export interface FootprintBenchmarks {
	medianCarbon: number;
	medianWater: number;
	/** Top-quartile (cleanest) carbon — the "clean-sourcing benchmark" */
	cleanCarbon: number;
	cleanWater: number;
}

export interface FootprintEstimate {
	carbonPerTon: number;
	waterPerKg: number;
	/** % above (+) or below (−) the clean-sourcing benchmark */
	carbonVsCleanPct: number;
	waterVsCleanPct: number;
	riskScore: number;
	riskTier: ExposureTier;
	/** The two regulations most triggered by this sourcing mix */
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

export function computeBenchmarks(all: CountrySustainability[]): FootprintBenchmarks {
	const carbon = all.map((c) => c.carbonPerTon).sort((a, b) => a - b);
	const water = all.map((c) => c.waterPerKg).sort((a, b) => a - b);
	return {
		medianCarbon: quantile(carbon, 0.5),
		medianWater: quantile(water, 0.5),
		cleanCarbon: quantile(carbon, 0.25),
		cleanWater: quantile(water, 0.25)
	};
}

const TIER_RANK: Record<ExposureTier, number> = { low: 0, medium: 1, high: 2 };

function dominantTier(countries: CountrySustainability[], key: 'cbamExposure' | 'csrdExposure' | 'eprExposure'): ExposureTier {
	let best: ExposureTier = 'low';
	for (const c of countries) {
		if (TIER_RANK[c[key]] > TIER_RANK[best]) best = c[key];
	}
	return best;
}

export function estimateFootprint(
	selected: CountrySustainability[],
	category: ProductCategory,
	benchmarks: FootprintBenchmarks
): FootprintEstimate {
	const mean = (fn: (c: CountrySustainability) => number) =>
		selected.reduce((sum, c) => sum + fn(c), 0) / selected.length;

	const carbonPerTon = Math.round(mean((c) => c.carbonPerTon) * category.energyFactor);
	const waterPerKg = Math.round(mean((c) => c.waterPerKg) * category.waterFactor);
	const riskScore = Math.min(100, Math.round(mean((c) => c.complianceRiskScore) + category.dppUrgency));

	const riskTier: ExposureTier = riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

	// Rank regulations by how strongly the selection triggers them
	const csrd = dominantTier(selected, 'csrdExposure');
	const epr = dominantTier(selected, 'eprExposure');
	const cbam = dominantTier(selected, 'cbamExposure');
	const minDpp = Math.min(...selected.map((c) => c.dppReadiness));
	const candidates: { key: RegulationKey; weight: number; reason: string }[] = [
		{
			key: 'csrd',
			weight: TIER_RANK[csrd] * 30 + 3,
			reason: 'EU buyers will require value-chain emissions and social data from this sourcing mix.'
		},
		{
			key: 'epr',
			weight: TIER_RANK[epr] * 30 + 2,
			reason: 'Products sold into the EU face eco-modulated Extended Producer Responsibility fees.'
		},
		{
			key: 'cbam',
			weight: TIER_RANK[cbam] * 30 + 1,
			reason: 'Energy-intensive production in this mix is exposed if CBAM extends to textiles.'
		},
		{
			key: 'dpp',
			weight: (100 - minDpp) * 0.6 + category.dppUrgency,
			reason: 'Traceability gaps in this mix will complicate Digital Product Passport compliance.'
		}
	];
	candidates.sort((a, b) => b.weight - a.weight);

	const biggestLever = selected.reduce((worst, c) =>
		c.complianceRiskScore > worst.complianceRiskScore ? c : worst
	);

	return {
		carbonPerTon,
		waterPerKg,
		carbonVsCleanPct: Math.round(((carbonPerTon - benchmarks.cleanCarbon) / benchmarks.cleanCarbon) * 100),
		waterVsCleanPct: Math.round(((waterPerKg - benchmarks.cleanWater) / benchmarks.cleanWater) * 100),
		riskScore,
		riskTier,
		topRegulations: candidates.slice(0, 2).map(({ key, reason }) => ({ key, reason })),
		biggestLever
	};
}
