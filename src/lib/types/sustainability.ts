export type SustainabilityMetric = 'carbon' | 'water' | 'labor' | 'transparency';

export type ProducerRegion = 'East Asia' | 'South Asia' | 'Southeast Asia' | 'Europe' | 'Americas' | 'Africa & Middle East';

export interface CountrySustainability {
	country: string;
	iso3: string;
	region: ProducerRegion;
	/** CO₂ equivalent in kg per metric ton of textile produced */
	carbonPerTon: number;
	/** Water usage in liters per kg of textile produced */
	waterPerKg: number;
	/** Labor conditions index: 0 (worst) to 100 (best) */
	laborIndex: number;
	/** Supply chain transparency index: 0 (opaque) to 100 (transparent) */
	transparencyIndex: number;
	/** Composite ESG score: 0 (worst) to 100 (best) */
	compositeScore: number;
	/** Source citations */
	sources: string;
}

export const METRIC_LABELS: Record<SustainabilityMetric, string> = {
	carbon: 'Carbon Footprint',
	water: 'Water Usage',
	labor: 'Labor Conditions',
	transparency: 'Transparency'
};

export const METRIC_UNITS: Record<SustainabilityMetric, string> = {
	carbon: 'kg CO₂e / ton',
	water: 'L / kg',
	labor: 'score (0–100)',
	transparency: 'score (0–100)'
};

export const ECO_COLORS: Record<SustainabilityMetric, string> = {
	carbon: '#6b8f71',
	water: '#4a90a4',
	labor: '#c4956a',
	transparency: '#5a7247'
};

export const REGION_COLORS: Record<ProducerRegion, string> = {
	'East Asia': '#487F84',
	'South Asia': '#c4956a',
	'Southeast Asia': '#5a9e6f',
	'Europe': '#1e3a5c',
	'Americas': '#db5111',
	'Africa & Middle East': '#5F597E'
};
