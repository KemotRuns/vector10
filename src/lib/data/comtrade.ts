import { z } from 'zod/v4';
import { COMTRADE_API_KEY } from '$env/static/private';
import type { HSChapter, TradeDirection, TradeFlow } from '$lib/types/trade';

const BASE_URL = 'https://comtradeapi.un.org';

/** Zod schema for raw Comtrade API response records */
const ComtradeRecordSchema = z.object({
	reporterCode: z.number(),
	reporterISO: z.string(),
	reporterDesc: z.string(),
	partnerCode: z.number(),
	partnerISO: z.string(),
	partnerDesc: z.string(),
	flowCode: z.string(),
	cmdCode: z.string(),
	cmdDesc: z.string().optional(),
	primaryValue: z.number().nullable(),
	netWgt: z.number().nullable(),
	period: z.union([z.string(), z.number()])
});

const ComtradeResponseSchema = z.object({
	count: z.number(),
	data: z.array(ComtradeRecordSchema),
	elapsedTime: z.string().optional(),
	error: z.string().optional()
});

type ComtradeRecord = z.infer<typeof ComtradeRecordSchema>;

/** Map Comtrade flow codes to our direction type */
function flowCodeToDirection(flowCode: string): TradeDirection | null {
	if (flowCode === 'M') return 'import';
	if (flowCode === 'X') return 'export';
	return null;
}

/** Extract the 2-digit HS chapter from a commodity code */
function extractHSChapter(cmdCode: string): HSChapter | null {
	const chapter = cmdCode.slice(0, 2);
	const num = parseInt(chapter, 10);
	if (num >= 50 && num <= 63) return chapter as HSChapter;
	return null;
}

/** Aggregate partners to skip (World, areas, etc.) */
const SKIP_PARTNERS = new Set(['W00', 'N/A', '']);

/** Convert a raw Comtrade record to our TradeFlow type */
function recordToTradeFlow(record: ComtradeRecord): TradeFlow | null {
	const direction = flowCodeToDirection(record.flowCode);
	const hsChapter = extractHSChapter(record.cmdCode);

	if (!direction || !hsChapter || record.primaryValue === null || record.primaryValue === 0) return null;
	if (record.reporterISO === 'N/A' || SKIP_PARTNERS.has(record.partnerISO)) return null;

	const year = typeof record.period === 'string' ? parseInt(record.period, 10) : record.period;

	return {
		reporter: record.reporterISO,
		partner: record.partnerISO,
		hsChapter,
		direction,
		tradeValue: record.primaryValue,
		netWeight: record.netWgt ?? undefined,
		year
	};
}

interface FetchTradeOptions {
	year: number;
	hsChapters?: string;
	reporterCode?: string;
	flowCode?: string;
	maxRecords?: number;
}

/**
 * Fetch textile trade data from UN Comtrade API v1.
 * Uses the subscription-key-authenticated endpoint.
 */
export async function fetchTradeData(options: FetchTradeOptions): Promise<TradeFlow[]> {
	const {
		year,
		hsChapters = '50,51,52,53,54,55,56,57,58,59,60,61,62,63',
		reporterCode = '',
		flowCode = 'M,X',
		maxRecords = 100000
	} = options;

	const params = new URLSearchParams({
		reporterCode,
		period: String(year),
		partnerCode: '',
		partner2Code: '',
		cmdCode: hsChapters,
		flowCode,
		customsCode: 'C00',
		motCode: '0',
		includeDesc: 'true',
		maxRecords: String(maxRecords)
	});

	const url = `${BASE_URL}/data/v1/get/C/A/HS?${params}`;

	console.log(`[Comtrade] Fetching: ${url.replace(COMTRADE_API_KEY, '***')}`);

	const response = await fetch(url, {
		headers: {
			'Ocp-Apim-Subscription-Key': COMTRADE_API_KEY,
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		const body = await response.text().catch(() => '');
		throw new Error(`Comtrade API error: ${response.status} ${response.statusText} — ${body}`);
	}

	const json = await response.json();
	const parsed = ComtradeResponseSchema.parse(json);

	console.log(`[Comtrade] Received ${parsed.count} records in ${parsed.elapsedTime ?? '?'}`);

	return parsed.data
		.map(recordToTradeFlow)
		.filter((flow): flow is TradeFlow => flow !== null);
}

/** Top textile-trading reporter codes for focused queries */
const TOP_REPORTERS = [
	'156',  // China
	'276',  // Germany
	'381',  // Italy
	'356',  // India
	'704',  // Vietnam
	'050',  // Bangladesh
	'792',  // Turkey (Türkiye)
	'840',  // USA
	'250',  // France
	'586',  // Pakistan
	'360',  // Indonesia
	'764',  // Thailand
	'410',  // South Korea
	'392',  // Japan
	'826',  // UK
	'724',  // Spain
	'056',  // Belgium
	'528',  // Netherlands
	'076',  // Brazil
	'116',  // Cambodia
].join(',');

/**
 * Fetch trade data for top textile exporters/importers for a given year.
 * Fetches all 14 HS chapters (50-63), both imports and exports.
 */
export async function fetchTextileTradeByYear(year: number): Promise<TradeFlow[]> {
	return fetchTradeData({
		year,
		reporterCode: TOP_REPORTERS
	});
}
