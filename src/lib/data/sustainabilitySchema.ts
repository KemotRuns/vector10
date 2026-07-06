import { z } from 'zod';
import type { SustainabilityDataset } from '$lib/types/sustainability';

const tierSchema = z.enum(['low', 'medium', 'high']);

const regionSchema = z.enum([
	'East Asia',
	'South & Central Asia',
	'Southeast Asia',
	'Europe',
	'Americas',
	'Africa & Middle East'
]);

const citationSchema = z.object({
	label: z.string(),
	publisher: z.string(),
	year: z.number(),
	url: z.string(),
	kind: z.enum(['public', 'vector10-assessment'])
});

const countrySchema = z.object({
	country: z.string(),
	iso3: z.string().length(3),
	region: regionSchema,
	gridCarbonIntensity: z.number().nonnegative(),
	lowCarbonShare: z.number().min(0).max(100),
	carbonPerTon: z.number().positive(),
	waterStress: z.number().min(0).max(5),
	waterPerKg: z.number().positive(),
	laborRisk: z.number().min(1).max(6),
	transparencyIndex: z.number().min(0).max(100),
	euExportShare: z.number().min(0).max(100),
	cbamExposure: tierSchema,
	csrdExposure: tierSchema,
	eprExposure: tierSchema,
	dppReadiness: z.number().min(0).max(100),
	footprintScore: z.number().min(0).max(100),
	complianceRiskScore: z.number().min(0).max(100),
	sourceIds: z.array(z.string()),
	notes: z.string().optional()
});

export const sustainabilityDatasetSchema = z.object({
	generatedAt: z.string(),
	sources: z.record(z.string(), citationSchema),
	countries: z.array(countrySchema).min(1)
}) satisfies z.ZodType<SustainabilityDataset>;

export function parseSustainabilityDataset(raw: unknown): SustainabilityDataset {
	return sustainabilityDatasetSchema.parse(raw);
}
