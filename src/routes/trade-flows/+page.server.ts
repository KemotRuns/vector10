import type { PageServerLoad } from './$types';
import type { TradeFlow } from '$lib/types/trade';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export const load: PageServerLoad = async () => {
	// Load demo data from static JSON
	const filePath = resolve('static/data/demo-trade-2023.json');
	const raw = await readFile(filePath, 'utf-8');
	const flows: TradeFlow[] = JSON.parse(raw);

	return { flows };
};
