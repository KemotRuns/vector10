import type { TaiwanData } from '$lib/types/taiwan';

export async function load({ fetch }) {
	const [tradeRes, geoRes] = await Promise.all([
		fetch('/data/taiwan-trade.json'),
		fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
	]);
	const data: TaiwanData = await tradeRes.json();
	const geojson = await geoRes.json();
	return { data, geojson };
}
