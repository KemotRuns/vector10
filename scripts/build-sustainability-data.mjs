// Builds static/data/sustainability.json from curated inputs in static/data/raw/sustainability/
// Usage: node scripts/build-sustainability-data.mjs

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'static/data/raw/sustainability');
const OUT = join(ROOT, 'static/data/sustainability.json');

// kWh of electricity per metric ton of finished textile (spinning → finishing)
const MWH_PER_TON = 5;
// kg CO2e/ton added for process heat (steam, drying), by dominant fiber base
const PROCESS_HEAT_ADDER = { cotton: 1200, mixed: 1050, synthetic: 950 };

const TIER_VALUE = { low: 20, medium: 60, high: 90 };
const TIERS = new Set(Object.keys(TIER_VALUE));

// footprintScore weights (all normalized 0–1, higher = cleaner)
const FOOTPRINT_WEIGHTS = { carbonPerTon: 0.4, waterPerKg: 0.2, waterStress: 0.2, lowCarbonShare: 0.2 };
// complianceRiskScore weights (all 0–100, higher = riskier)
const RISK_WEIGHTS = { csrd: 0.25, epr: 0.2, cbam: 0.2, dpp: 0.2, labor: 0.15 };

function readCsv(name) {
	const lines = readFileSync(join(RAW, name), 'utf-8').trim().split('\n');
	const header = lines[0].split(',');
	return lines.slice(1).map((line) => {
		const cells = line.split(',');
		return Object.fromEntries(header.map((key, i) => [key, cells[i] ?? '']));
	});
}

function indexByIso3(rows, name) {
	const map = new Map();
	for (const row of rows) {
		if (map.has(row.iso3)) fail(`${name}: duplicate iso3 ${row.iso3}`);
		map.set(row.iso3, row);
	}
	return map;
}

function fail(msg) {
	console.error(`✖ ${msg}`);
	process.exit(1);
}

const countries = readCsv('countries.csv');
const grid = indexByIso3(readCsv('grid.csv'), 'grid.csv');
const water = indexByIso3(readCsv('water.csv'), 'water.csv');
const labor = indexByIso3(readCsv('labor.csv'), 'labor.csv');
const transparency = indexByIso3(readCsv('transparency.csv'), 'transparency.csv');
const regulatory = indexByIso3(readCsv('regulatory.csv'), 'regulatory.csv');
const sources = JSON.parse(readFileSync(join(RAW, 'sources.json'), 'utf-8'));

// --- Join, validating every country has every metric ---
const missing = [];
for (const c of countries) {
	for (const [name, map] of [
		['grid', grid],
		['water', water],
		['labor', labor],
		['transparency', transparency],
		['regulatory', regulatory]
	]) {
		if (!map.has(c.iso3)) missing.push(`${c.iso3} (${name}.csv)`);
	}
}
if (missing.length > 0) fail(`Missing metric rows for: ${missing.join(', ')}`);

const num = (row, key, iso3) => {
	const v = Number(row[key]);
	if (!Number.isFinite(v)) fail(`${iso3}: ${key} is not a number ("${row[key]}")`);
	return v;
};
const tier = (row, key, iso3) => {
	if (!TIERS.has(row[key])) fail(`${iso3}: ${key} invalid tier "${row[key]}"`);
	return row[key];
};

const rows = countries.map((c) => {
	const g = grid.get(c.iso3);
	const w = water.get(c.iso3);
	const l = labor.get(c.iso3);
	const t = transparency.get(c.iso3);
	const r = regulatory.get(c.iso3);

	if (!(c.fiberBase in PROCESS_HEAT_ADDER)) fail(`${c.iso3}: unknown fiberBase "${c.fiberBase}"`);
	for (const id of c.sourceIds.split(';')) {
		if (!(id in sources)) fail(`${c.iso3}: unknown source id "${id}"`);
	}

	const gridCarbonIntensity = num(g, 'gridCarbonIntensity', c.iso3);
	return {
		country: c.name,
		iso3: c.iso3,
		region: c.region,
		gridCarbonIntensity,
		lowCarbonShare: num(g, 'lowCarbonShare', c.iso3),
		carbonPerTon: Math.round(gridCarbonIntensity * MWH_PER_TON + PROCESS_HEAT_ADDER[c.fiberBase]),
		waterStress: num(w, 'waterStress', c.iso3),
		waterPerKg: num(w, 'waterPerKg', c.iso3),
		laborRisk: num(l, 'itucRating', c.iso3),
		transparencyIndex: num(t, 'transparencyIndex', c.iso3),
		euExportShare: num(c, 'euExportShare', c.iso3),
		cbamExposure: tier(r, 'cbamExposure', c.iso3),
		csrdExposure: tier(r, 'csrdExposure', c.iso3),
		eprExposure: tier(r, 'eprExposure', c.iso3),
		dppReadiness: num(r, 'dppReadiness', c.iso3),
		sourceIds: c.sourceIds.split(';'),
		notes: c.notes || undefined
	};
});

// --- Composite scores ---
const minMax = (values) => {
	const min = Math.min(...values);
	const max = Math.max(...values);
	return (v) => (max === min ? 0.5 : (v - min) / (max - min));
};
const normCarbon = minMax(rows.map((r) => r.carbonPerTon));
const normWater = minMax(rows.map((r) => r.waterPerKg));
const normStress = minMax(rows.map((r) => r.waterStress));
const normLowCarbon = minMax(rows.map((r) => r.lowCarbonShare));

for (const r of rows) {
	// higher = cleaner: invert lower-is-better metrics
	const footprint01 =
		FOOTPRINT_WEIGHTS.carbonPerTon * (1 - normCarbon(r.carbonPerTon)) +
		FOOTPRINT_WEIGHTS.waterPerKg * (1 - normWater(r.waterPerKg)) +
		FOOTPRINT_WEIGHTS.waterStress * (1 - normStress(r.waterStress)) +
		FOOTPRINT_WEIGHTS.lowCarbonShare * normLowCarbon(r.lowCarbonShare);
	r.footprintScore = Math.round(footprint01 * 100);

	// higher = riskier; labor scaled 1–6 → 0–100 (forced-labor regulation is compliance risk)
	const risk =
		RISK_WEIGHTS.csrd * TIER_VALUE[r.csrdExposure] +
		RISK_WEIGHTS.epr * TIER_VALUE[r.eprExposure] +
		RISK_WEIGHTS.cbam * TIER_VALUE[r.cbamExposure] +
		RISK_WEIGHTS.dpp * (100 - r.dppReadiness) +
		RISK_WEIGHTS.labor * (((r.laborRisk - 1) / 5) * 100);
	r.complianceRiskScore = Math.round(risk);
}

rows.sort((a, b) => b.complianceRiskScore - a.complianceRiskScore);

const dataset = {
	generatedAt: new Date().toISOString().slice(0, 10),
	sources,
	countries: rows
};

writeFileSync(OUT, JSON.stringify(dataset, null, '\t') + '\n');

// --- Summary ---
const byRegion = {};
for (const r of rows) byRegion[r.region] = (byRegion[r.region] ?? 0) + 1;
console.log(`✔ Wrote ${rows.length} countries → ${OUT}`);
for (const [region, count] of Object.entries(byRegion)) console.log(`  ${region}: ${count}`);
const top = rows[0];
const bottom = rows[rows.length - 1];
console.log(`  Highest compliance risk: ${top.country} (${top.complianceRiskScore})`);
console.log(`  Lowest compliance risk: ${bottom.country} (${bottom.complianceRiskScore})`);
