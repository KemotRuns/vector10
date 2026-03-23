import type { PageLoad } from './$types';
import type { ConsumerSpendData } from '$lib/types/consumer';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/data/consumer-spending.json');
	const countries: ConsumerSpendData[] = await res.json();

	return { countries };
};
