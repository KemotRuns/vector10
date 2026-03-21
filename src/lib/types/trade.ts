/**
 * Core type definitions for UN Comtrade textile trade data.
 */

/** HS Chapter codes for textiles (50-63) */
export type HSChapter =
	| '50' | '51' | '52' | '53' | '54' | '55'
	| '56' | '57' | '58' | '59' | '60' | '61'
	| '62' | '63';

/** Human-readable labels for each HS chapter */
export const HS_CHAPTER_LABELS: Record<HSChapter, string> = {
	'50': 'Silk',
	'51': 'Wool & Animal Hair',
	'52': 'Cotton',
	'53': 'Vegetable Fibres',
	'54': 'Man-made Filaments',
	'55': 'Man-made Staple Fibres',
	'56': 'Wadding, Felt & Nonwovens',
	'57': 'Carpets & Floor Coverings',
	'58': 'Special Woven Fabrics',
	'59': 'Coated & Laminated Fabrics',
	'60': 'Knitted Fabrics',
	'61': 'Knitted Apparel',
	'62': 'Woven Apparel',
	'63': 'Other Textile Articles'
};

/** Trade flow direction */
export type TradeDirection = 'import' | 'export';

/** A single trade flow record (aggregated) */
export interface TradeFlow {
	/** Reporter country ISO3 code */
	reporter: string;
	/** Partner country ISO3 code */
	partner: string;
	/** HS chapter (50-63) */
	hsChapter: HSChapter;
	/** Trade direction from reporter's perspective */
	direction: TradeDirection;
	/** Trade value in USD */
	tradeValue: number;
	/** Net weight in kg (if available) */
	netWeight?: number;
	/** Year of the data */
	year: number;
}

/** Country metadata for map rendering */
export interface Country {
	iso3: string;
	name: string;
	latitude: number;
	longitude: number;
}

/** Aggregated flow for arc visualization */
export interface ArcFlow {
	source: Country;
	target: Country;
	hsChapter: HSChapter;
	tradeValue: number;
	year: number;
}

/** Filter state for the trade flow dashboard */
export interface TradeFlowFilters {
	year: number;
	hsChapters: HSChapter[];
	direction: TradeDirection;
	minTradeValue: number;
	selectedCountry?: string;
}
