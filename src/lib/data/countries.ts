import type { Country } from '$lib/types/trade';

/** Top textile trading countries with coordinates for globe rendering */
export const COUNTRIES: Record<string, Country> = {
	CHN: { iso3: 'CHN', name: 'China', latitude: 35.86, longitude: 104.20 },
	IND: { iso3: 'IND', name: 'India', latitude: 20.59, longitude: 78.96 },
	BGD: { iso3: 'BGD', name: 'Bangladesh', latitude: 23.68, longitude: 90.36 },
	VNM: { iso3: 'VNM', name: 'Viet Nam', latitude: 14.06, longitude: 108.28 },
	TUR: { iso3: 'TUR', name: 'Türkiye', latitude: 38.96, longitude: 35.24 },
	DEU: { iso3: 'DEU', name: 'Germany', latitude: 51.17, longitude: 10.45 },
	ITA: { iso3: 'ITA', name: 'Italy', latitude: 41.87, longitude: 12.57 },
	USA: { iso3: 'USA', name: 'United States', latitude: 37.09, longitude: -95.71 },
	FRA: { iso3: 'FRA', name: 'France', latitude: 46.23, longitude: 2.21 },
	GBR: { iso3: 'GBR', name: 'United Kingdom', latitude: 55.38, longitude: -3.44 },
	ESP: { iso3: 'ESP', name: 'Spain', latitude: 40.46, longitude: -3.75 },
	PAK: { iso3: 'PAK', name: 'Pakistan', latitude: 30.38, longitude: 69.35 },
	IDN: { iso3: 'IDN', name: 'Indonesia', latitude: -0.79, longitude: 113.92 },
	KOR: { iso3: 'KOR', name: 'South Korea', latitude: 35.91, longitude: 127.77 },
	JPN: { iso3: 'JPN', name: 'Japan', latitude: 36.20, longitude: 138.25 },
	NLD: { iso3: 'NLD', name: 'Netherlands', latitude: 52.13, longitude: 5.29 },
	BEL: { iso3: 'BEL', name: 'Belgium', latitude: 50.50, longitude: 4.47 },
	HKG: { iso3: 'HKG', name: 'Hong Kong', latitude: 22.40, longitude: 114.11 },
	THA: { iso3: 'THA', name: 'Thailand', latitude: 15.87, longitude: 100.99 },
	KHM: { iso3: 'KHM', name: 'Cambodia', latitude: 12.57, longitude: 104.99 },
	MMR: { iso3: 'MMR', name: 'Myanmar', latitude: 21.91, longitude: 95.96 },
	LKA: { iso3: 'LKA', name: 'Sri Lanka', latitude: 7.87, longitude: 80.77 },
	BRA: { iso3: 'BRA', name: 'Brazil', latitude: -14.24, longitude: -51.93 },
	MEX: { iso3: 'MEX', name: 'Mexico', latitude: 23.63, longitude: -102.55 },
	POL: { iso3: 'POL', name: 'Poland', latitude: 51.92, longitude: 19.15 },
	PRT: { iso3: 'PRT', name: 'Portugal', latitude: 39.40, longitude: -8.22 },
	CZE: { iso3: 'CZE', name: 'Czech Republic', latitude: 49.82, longitude: 15.47 },
	ROU: { iso3: 'ROU', name: 'Romania', latitude: 45.94, longitude: 24.97 },
	MAR: { iso3: 'MAR', name: 'Morocco', latitude: 31.79, longitude: -7.09 },
	TUN: { iso3: 'TUN', name: 'Tunisia', latitude: 33.89, longitude: 9.54 },
	EGY: { iso3: 'EGY', name: 'Egypt', latitude: 26.82, longitude: 30.80 },
	ETH: { iso3: 'ETH', name: 'Ethiopia', latitude: 9.15, longitude: 40.49 },
	TWN: { iso3: 'TWN', name: 'Taiwan', latitude: 23.70, longitude: 120.96 },
	SGP: { iso3: 'SGP', name: 'Singapore', latitude: 1.35, longitude: 103.82 },
	ARE: { iso3: 'ARE', name: 'United Arab Emirates', latitude: 23.42, longitude: 53.85 },
	CAN: { iso3: 'CAN', name: 'Canada', latitude: 56.13, longitude: -106.35 },
	AUS: { iso3: 'AUS', name: 'Australia', latitude: -25.27, longitude: 133.78 },
	CHE: { iso3: 'CHE', name: 'Switzerland', latitude: 46.82, longitude: 8.23 },
	AUT: { iso3: 'AUT', name: 'Austria', latitude: 47.52, longitude: 14.55 },
	SWE: { iso3: 'SWE', name: 'Sweden', latitude: 60.13, longitude: 18.64 },
};

/** Look up country by ISO3 code, with fallback for unknown countries */
export function getCountry(iso3: string): Country | undefined {
	return COUNTRIES[iso3];
}
