import type { PageServerLoad } from './$types';
import type { TradeFlow } from '$lib/types/trade';
import { fetchTextileTradeByYear } from '$lib/data/comtrade';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

const CACHE_DIR = resolve('.cache');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getCachedOrFetch(year: number): Promise<TradeFlow[]> {
	const cacheFile = resolve(CACHE_DIR, `trade-${year}.json`);

	// Try cache first
	try {
		const raw = await readFile(cacheFile, 'utf-8');
		const cached = JSON.parse(raw) as { ts: number; data: TradeFlow[] };
		if (Date.now() - cached.ts < CACHE_TTL_MS) {
			console.log(`[Cache] Using cached data for ${year} (${cached.data.length} flows)`);
			return cached.data;
		}
	} catch {
		// No cache or expired — fetch fresh
	}

	// Fetch from API
	console.log(`[Cache] Fetching fresh data for ${year} from Comtrade API...`);
	const flows = await fetchTextileTradeByYear(year);

	// Write to cache
	try {
		await mkdir(CACHE_DIR, { recursive: true });
		await writeFile(cacheFile, JSON.stringify({ ts: Date.now(), data: flows }));
		console.log(`[Cache] Saved ${flows.length} flows to cache`);
	} catch (e) {
		console.warn('[Cache] Failed to write cache:', e);
	}

	return flows;
}

/** Fallback to demo data if API fails */
async function loadDemoData(): Promise<TradeFlow[]> {
	const filePath = resolve('static/data/demo-trade-2023.json');
	const raw = await readFile(filePath, 'utf-8');
	return JSON.parse(raw);
}

export const load: PageServerLoad = async () => {
	let flows: TradeFlow[];
	let dataSource: 'api' | 'demo';

	try {
		flows = await getCachedOrFetch(2023);
		dataSource = 'api';
		if (flows.length === 0) throw new Error('API returned no flows');
	} catch (e) {
		console.error('[TradeFlows] API fetch failed, falling back to demo data:', e);
		flows = await loadDemoData();
		dataSource = 'demo';
	}

	return { flows, dataSource };
};
