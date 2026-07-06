export interface ProductCategory {
	id: string;
	label: string;
	hsChapters: number[];
	/** Multiplier on country carbonPerTon (process energy intensity) */
	energyFactor: number;
	/** Multiplier on country waterPerKg (cotton-heavy ≫ synthetic) */
	waterFactor: number;
	/** 0–10 bump on compliance risk — how early this category is hit by ESPR/DPP */
	dppUrgency: number;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
	{
		id: 'cotton-apparel',
		label: 'Cotton apparel',
		hsChapters: [52, 61, 62],
		energyFactor: 1.0,
		waterFactor: 1.35,
		dppUrgency: 8
	},
	{
		id: 'synthetics',
		label: 'Synthetics & technical textiles',
		hsChapters: [54, 55, 56, 59, 60],
		energyFactor: 1.2,
		waterFactor: 0.55,
		dppUrgency: 5
	},
	{
		id: 'wool-luxury',
		label: 'Wool & luxury fibers',
		hsChapters: [50, 51, 53],
		energyFactor: 0.9,
		waterFactor: 1.1,
		dppUrgency: 6
	},
	{
		id: 'home-madeups',
		label: 'Home textiles & made-ups',
		hsChapters: [57, 58, 63],
		energyFactor: 0.95,
		waterFactor: 1.05,
		dppUrgency: 4
	},
	{
		id: 'denim',
		label: 'Denim & heavy wovens',
		hsChapters: [52, 62],
		energyFactor: 1.15,
		waterFactor: 1.5,
		dppUrgency: 7
	},
	{
		id: 'mixed',
		label: 'Mixed / other',
		hsChapters: [],
		energyFactor: 1.0,
		waterFactor: 1.0,
		dppUrgency: 5
	}
];
