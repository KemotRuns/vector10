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

export interface TaiwanData {
	records: TaiwanRecord[];
	chapterTotals: {
		'2025': { Imports: Record<string, number>; Exports: Record<string, number> };
		'2026Q1': { Imports: Record<string, number>; Exports: Record<string, number> };
	};
}
