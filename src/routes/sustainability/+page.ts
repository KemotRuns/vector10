import type { PageLoad } from './$types';
import type { CountrySustainability } from '$lib/types/sustainability-legacy';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/data/sustainability.json');
	const countries: CountrySustainability[] = await res.json();

	return { countries };
};
