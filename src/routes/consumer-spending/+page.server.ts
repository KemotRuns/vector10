import type { PageServerLoad } from './$types';
import type { ConsumerSpendData } from '$lib/types/consumer';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export const load: PageServerLoad = async () => {
	const filePath = resolve('static/data/consumer-spending.json');
	const raw = await readFile(filePath, 'utf-8');
	const countries: ConsumerSpendData[] = JSON.parse(raw);

	return { countries };
};
