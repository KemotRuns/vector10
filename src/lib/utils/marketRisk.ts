import type {
	CountrySustainability,
	ExposureTier,
	LeadTier,
	MarketKey,
	TariffStatus
} from '$lib/types/sustainability';

/** A country enriched with scores conditional on the visitor's selling markets */
export interface MarketView extends CountrySustainability {
	marketRisk: number;
	costIndex: number;
}

const TIER_VALUE: Record<ExposureTier, number> = { low: 20, medium: 60, high: 90 };
const DUTY_COST: Record<TariffStatus, number> = { free: 5, reduced: 35, mfn: 70, penalty: 100 };
const LEAD_COST: Record<LeadTier, number> = { near: 10, mid: 55, far: 90 };

/** ITUC 1–6 rating → 0–100 */
const labor100 = (c: CountrySustainability): number => ((c.laborRisk - 1) / 5) * 100;

/**
 * Compliance risk conditional on where the brand sells.
 * EU uses the pipeline's full score (CSRD/EPR/CBAM/DPP/labor);
 * US is dominated by UFLPA and traceability; JP/KR and RoW carry
 * little textile regulation today, so their formulas are damped.
 */
export function riskForMarket(c: CountrySustainability, market: MarketKey): number {
	switch (market) {
		case 'eu':
			return c.complianceRiskScore;
		case 'us':
			return Math.round(
				0.45 * TIER_VALUE[c.uflpaExposure] +
					0.25 * labor100(c) +
					0.2 * (100 - c.dppReadiness) +
					0.1 * (100 - c.transparencyIndex)
			);
		case 'asia':
			return Math.round(
				(0.4 * labor100(c) + 0.3 * (100 - c.transparencyIndex) + 0.3 * (100 - c.dppReadiness)) * 0.45
			);
		case 'row':
			return Math.round((0.6 * labor100(c) + 0.4 * (100 - c.transparencyIndex)) * 0.35);
	}
}

/**
 * Directional sourcing cost index (0–100, higher = costlier) for one market:
 * labor 60%, tariff treatment 25%, shipping lead time 15%.
 * JP/KR and RoW have no curated duty/lead data — labor-weighted with a neutral remainder.
 */
export function costForMarket(c: CountrySustainability, market: MarketKey): number {
	switch (market) {
		case 'eu':
			return Math.round(0.6 * c.laborCostIndex + 0.25 * DUTY_COST[c.tariffEu] + 0.15 * LEAD_COST[c.leadEu]);
		case 'us':
			return Math.round(0.6 * c.laborCostIndex + 0.25 * DUTY_COST[c.tariffUs] + 0.15 * LEAD_COST[c.leadUs]);
		default:
			return Math.round(0.75 * c.laborCostIndex + 0.25 * 55);
	}
}

const meanOver = (markets: MarketKey[], fn: (m: MarketKey) => number): number =>
	Math.round(markets.reduce((sum, m) => sum + fn(m), 0) / markets.length);

export function blendedRisk(c: CountrySustainability, markets: MarketKey[]): number {
	if (markets.length === 0) return c.complianceRiskScore;
	return meanOver(markets, (m) => riskForMarket(c, m));
}

export function blendedCost(c: CountrySustainability, markets: MarketKey[]): number {
	if (markets.length === 0) return costForMarket(c, 'eu');
	return meanOver(markets, (m) => costForMarket(c, m));
}

export function toMarketView(c: CountrySustainability, markets: MarketKey[]): MarketView {
	return { ...c, marketRisk: blendedRisk(c, markets), costIndex: blendedCost(c, markets) };
}
