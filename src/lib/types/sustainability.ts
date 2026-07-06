export type ProducerRegion =
	| 'East Asia'
	| 'South & Central Asia'
	| 'Southeast Asia'
	| 'Europe'
	| 'Americas'
	| 'Africa & Middle East';

export type ExposureTier = 'low' | 'medium' | 'high';

/** Selling markets the brand operates in — reshapes compliance risk and cost */
export type MarketKey = 'eu' | 'us' | 'asia' | 'row';

export const MARKET_LABELS: Record<MarketKey, string> = {
	eu: 'EU & UK',
	us: 'North America',
	asia: 'Japan & Korea',
	row: 'Rest of world'
};

/** Tariff treatment of the country's textiles entering a market */
export type TariffStatus = 'free' | 'reduced' | 'mfn' | 'penalty';

export const TARIFF_LABELS: Record<TariffStatus, string> = {
	free: 'Duty-free',
	reduced: 'Reduced duty',
	mfn: 'Full MFN duty',
	penalty: 'Penalty tariffs'
};

export type LeadTier = 'near' | 'mid' | 'far';

export const LEAD_LABELS: Record<LeadTier, string> = {
	near: 'Near-shore',
	mid: 'Mid-distance',
	far: 'Deep-sea'
};

export type MetricProvenance = 'public' | 'modeled' | 'vector10-assessment';

export interface SourceCitation {
	label: string;
	publisher: string;
	year: number;
	url: string;
	kind: 'public' | 'vector10-assessment';
}

export interface CountrySustainability {
	country: string;
	iso3: string;
	region: ProducerRegion;
	/** Grid carbon intensity in gCO₂eq/kWh (Ember) */
	gridCarbonIntensity: number;
	/** Share of electricity from low-carbon sources, % (Ember) */
	lowCarbonShare: number;
	/** kg CO₂e per metric ton of textile — modeled from grid intensity + process heat */
	carbonPerTon: number;
	/** WRI Aqueduct 4.0 baseline water stress, 0 (low) – 5 (extreme) */
	waterStress: number;
	/** Water usage in liters per kg of textile — modeled from fiber mix */
	waterPerKg: number;
	/** ITUC Global Rights Index rating, 1 (best) – 6 (worst, "5+") */
	laborRisk: number;
	/** Supply chain transparency, 0 (opaque) – 100 (transparent) */
	transparencyIndex: number;
	/** Share of the country's HS 50–63 exports destined for the EU27, % */
	euExportShare: number;
	cbamExposure: ExposureTier;
	csrdExposure: ExposureTier;
	eprExposure: ExposureTier;
	/** Digital Product Passport readiness, 0–100 (Vector10 assessment) */
	dppReadiness: number;
	/** Garment-sector labor cost, USD/month (ILO-derived) */
	laborCostUsd: number;
	/** Labor cost on a log-scaled 0–100 index across the dataset */
	laborCostIndex: number;
	/** Tariff treatment entering the EU27 */
	tariffEu: TariffStatus;
	/** Tariff treatment entering the US */
	tariffUs: TariffStatus;
	/** US UFLPA (forced-labor import ban) exposure — Vector10 assessment */
	uflpaExposure: ExposureTier;
	/** Shipping lead-time tier to the EU */
	leadEu: LeadTier;
	/** Shipping lead-time tier to the US */
	leadUs: LeadTier;
	/** 0–100, higher = cleaner footprint */
	footprintScore: number;
	/** 0–100, higher = more regulatory compliance risk */
	complianceRiskScore: number;
	/** Keys into the dataset's citation registry */
	sourceIds: string[];
	notes?: string;
}

export interface SustainabilityDataset {
	generatedAt: string;
	sources: Record<string, SourceCitation>;
	countries: CountrySustainability[];
}

export const TIER_LABELS: Record<ExposureTier, string> = {
	low: 'Low',
	medium: 'Medium',
	high: 'High'
};

export const TIER_COLORS: Record<ExposureTier, string> = {
	low: '#5a9e6f',
	medium: '#c4956a',
	high: '#c0574f'
};

export const REGION_COLORS: Record<ProducerRegion, string> = {
	'East Asia': '#487F84',
	'South & Central Asia': '#c4956a',
	'Southeast Asia': '#5a9e6f',
	Europe: '#1e3a5c',
	Americas: '#db5111',
	'Africa & Middle East': '#5F597E'
};

/** Regulation keys shown as chips in detail panel / table */
export type RegulationKey = 'cbam' | 'csrd' | 'epr' | 'dpp' | 'uflpa';

export const REGULATION_LABELS: Record<RegulationKey, string> = {
	cbam: 'CBAM',
	csrd: 'CSRD',
	epr: 'EPR',
	dpp: 'DPP',
	uflpa: 'UFLPA'
};

export const REGULATION_NAMES: Record<RegulationKey, string> = {
	cbam: 'Carbon Border Adjustment Mechanism (EU)',
	csrd: 'Corporate Sustainability Reporting Directive (EU)',
	epr: 'Extended Producer Responsibility, textiles (EU)',
	dpp: 'Digital Product Passport / ESPR (EU)',
	uflpa: 'Uyghur Forced Labor Prevention Act (US)'
};

/** Which fields are hard public data, which are modeled, which are Vector10 judgment */
export const METRIC_PROVENANCE: Record<string, MetricProvenance> = {
	gridCarbonIntensity: 'public',
	lowCarbonShare: 'public',
	waterStress: 'public',
	laborRisk: 'public',
	euExportShare: 'public',
	carbonPerTon: 'modeled',
	waterPerKg: 'modeled',
	transparencyIndex: 'modeled',
	cbamExposure: 'vector10-assessment',
	csrdExposure: 'vector10-assessment',
	eprExposure: 'vector10-assessment',
	dppReadiness: 'vector10-assessment',
	uflpaExposure: 'vector10-assessment',
	laborCostUsd: 'public',
	tariffEu: 'public',
	tariffUs: 'public',
	laborCostIndex: 'modeled',
	leadEu: 'modeled',
	leadUs: 'modeled',
	footprintScore: 'modeled',
	complianceRiskScore: 'modeled'
};

export const PROVENANCE_LABELS: Record<MetricProvenance, string> = {
	public: 'Public data',
	modeled: 'Modeled',
	'vector10-assessment': 'Vector10 assessment'
};
