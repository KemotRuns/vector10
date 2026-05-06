import type { TaiwanData } from '$lib/types/taiwan';

export async function load({ fetch }) {
	const res = await fetch('/data/taiwan-trade.json');
	const data: TaiwanData = await res.json();
	return { data };
}
