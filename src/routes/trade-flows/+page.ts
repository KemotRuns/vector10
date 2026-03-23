import type { PageLoad } from './$types';
import type { TradeFlow } from '$lib/types/trade';

interface CompactFlow {
	r: string;
	p: string;
	h: string;
	d: 'X' | 'M';
	v: number;
	y: number;
}

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/data/trade-2023.json');
	const compact: CompactFlow[] = await res.json();

	const flows: TradeFlow[] = compact.map(c => ({
		reporter: c.r,
		partner: c.p,
		hsChapter: c.h as TradeFlow['hsChapter'],
		direction: c.d === 'X' ? 'export' : 'import',
		tradeValue: c.v,
		year: c.y
	}));

	return { flows, dataSource: 'static' as const };
};
