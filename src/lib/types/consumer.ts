export type ConsumerRegion = 'Americas' | 'Europe' | 'Asia' | 'Oceania' | 'Middle East' | 'Africa';

export interface ConsumerSpendData {
	country: string;
	iso3: string;
	spendPerCapita: number;
	itemsPerCapita: number;
	region: ConsumerRegion;
	population: number;
}

export const REGION_COLORS: Record<ConsumerRegion, string> = {
	'Americas': '#db5111',
	'Europe': '#1e3a5c',
	'Asia': '#487F84',
	'Oceania': '#F5A623',
	'Middle East': '#5F597E',
	'Africa': '#5a9e6f'
};
