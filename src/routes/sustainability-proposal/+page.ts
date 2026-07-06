import type { PageLoad } from './$types';
import { parseSustainabilityDataset } from '$lib/data/sustainabilitySchema';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/data/sustainability-v2.json');
	const dataset = parseSustainabilityDataset(await res.json());

	return { dataset };
};
