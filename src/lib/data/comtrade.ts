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
	cmdDesc: z.string(),
	primaryValue: z.number().nullable(),
	netWgt: z.number().nullable(),
	period: z.number()
});

const ComtradeResponseSchema = z.object({
	count: z.number(),
	data: z.array(ComtradeRecordSchema)
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

/** Convert a raw Comtrade record to our TradeFlow type */
function recordToTradeFlow(record: ComtradeRecord): TradeFlow | null {
	const direction = flowCodeToDirection(record.flowCode);
	const hsChapter = extractHSChapter(record.cmdCode);

	if (!direction || !hsChapter || record.primaryValue === null) return null;
	if (record.reporterISO === 'N/A' || record.partnerISO === 'N/A') return null;

	return {
		reporter: record.reporterISO,
		partner: record.partnerISO,
		hsChapter,
		direction,
		tradeValue: record.primaryValue,
		netWeight: record.netWgt ?? undefined,
		year: record.period
	};
}

interface FetchTradeOptions {
	year: number;
	hsChapter?: HSChapter;
	reporter?: string;
	partner?: string;
	direction?: TradeDirection;
}

/**
 * Fetch textile trade data from UN Comtrade API v1.
 * Uses the subscription-key-authenticated endpoint.
 */
export async function fetchTradeData(options: FetchTradeOptions): Promise<TradeFlow[]> {
	const { year, hsChapter, reporter, direction } = options;

	const flowCode = direction === 'import' ? 'M' : direction === 'export' ? 'X' : 'M,X';
	const cmdCode = hsChapter ?? '50,51,52,53,54,55,56,57,58,59,60,61,62,63';

	const params = new URLSearchParams({
		reporterCode: reporter ?? '',
		period: String(year),
		partnerCode: '',
		partner2Code: '',
		cmdCode,
		flowCode,
		customsCode: 'C00',
		motCode: '0',
		includeDesc: 'true'
	});

	const url = `${BASE_URL}/data/v1/get/C/A/HS?${params}`;

	const response = await fetch(url, {
		headers: {
			'Ocp-Apim-Subscription-Key': COMTRADE_API_KEY,
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Comtrade API error: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();
	const parsed = ComtradeResponseSchema.parse(json);

	return parsed.data
		.map(recordToTradeFlow)
		.filter((flow): flow is TradeFlow => flow !== null);
}

/**
 * Fetch trade data for all textile HS chapters for a given year.
 * Aggregates at the 2-digit chapter level.
 */
export async function fetchTextileTradeByYear(year: number): Promise<TradeFlow[]> {
	return fetchTradeData({ year });
}
