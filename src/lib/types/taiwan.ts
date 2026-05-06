export interface TaiwanRecord {
	direction: 'Imports' | 'Exports';
	country: string;
	code: string;
	description: string;
	value: number;
	lat: number;
	lon: number;
}

export interface TaiwanArc {
	country: string;
	direction: 'Imports' | 'Exports';
	value: number;
	lat: number;
	lon: number;
	subcats: Record<string, number>;
}

export interface TaiwanYearData {
	label: string;
	records: TaiwanRecord[];
}

export interface TaiwanData {
	years: Record<string, TaiwanYearData>;
}
