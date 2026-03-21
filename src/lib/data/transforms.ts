import type { TradeFlow, ArcFlow, HSChapter, TradeDirection } from '$lib/types/trade';
import { getCountry } from './countries';

/** Aggregate trade flows by reporter-partner-hsChapter, summing values */
export function aggregateFlows(flows: TradeFlow[]): TradeFlow[] {
	const map = new Map<string, TradeFlow>();

	for (const flow of flows) {
		const key = `${flow.reporter}-${flow.partner}-${flow.hsChapter}-${flow.direction}-${flow.year}`;
		const existing = map.get(key);
		if (existing) {
			existing.tradeValue += flow.tradeValue;
			if (flow.netWeight && existing.netWeight) {
				existing.netWeight += flow.netWeight;
			}
		} else {
			map.set(key, { ...flow });
		}
	}

	return Array.from(map.values());
}

/** Convert trade flows to arc data for globe visualization */
export function flowsToArcs(flows: TradeFlow[]): ArcFlow[] {
	const arcs: ArcFlow[] = [];

	for (const flow of flows) {
		const source = getCountry(flow.direction === 'export' ? flow.reporter : flow.partner);
		const target = getCountry(flow.direction === 'export' ? flow.partner : flow.reporter);

		if (!source || !target) continue;

		arcs.push({
			source,
			target,
			hsChapter: flow.hsChapter,
			tradeValue: flow.tradeValue,
			year: flow.year
		});
	}

	return arcs;
}

/** Get top N countries by total trade value */
export function topCountries(
	flows: TradeFlow[],
	direction: TradeDirection,
	n: number = 10
): Array<{ iso3: string; name: string; totalValue: number }> {
	const totals = new Map<string, number>();

	for (const flow of flows) {
		if (flow.direction !== direction) continue;
		const country = flow.reporter;
		totals.set(country, (totals.get(country) ?? 0) + flow.tradeValue);
	}

	return Array.from(totals.entries())
		.map(([iso3, totalValue]) => ({
			iso3,
			name: getCountry(iso3)?.name ?? iso3,
			totalValue
		}))
		.sort((a, b) => b.totalValue - a.totalValue)
		.slice(0, n);
}

/** Group flows by HS chapter with totals */
export function flowsByChapter(
	flows: TradeFlow[]
): Map<HSChapter, number> {
	const map = new Map<HSChapter, number>();

	for (const flow of flows) {
		map.set(flow.hsChapter, (map.get(flow.hsChapter) ?? 0) + flow.tradeValue);
	}

	return map;
}

/** Format trade value as human-readable string */
export function formatTradeValue(value: number): string {
	if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
	if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
	if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
	return `$${value.toFixed(0)}`;
}
