// Processes Taiwan customs CSV files → static/data/taiwan-trade.json
// Usage: node scripts/process-taiwan-csv.mjs

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'static/data/raw');
const OUT = join(ROOT, 'static/data/taiwan-trade.json');

// CSV country name → { displayName, lat, lon }
const COORD_MAP = {
  'Afghanistan':                        { name: 'Afghanistan',                lat: 33.94,  lon: 67.71 },
  'Albania':                            { name: 'Albania',                     lat: 41.15,  lon: 20.17 },
  'Algeria':                            { name: 'Algeria',                     lat: 28.03,  lon: 1.66  },
  'Angola':                             { name: 'Angola',                      lat: -11.20, lon: 17.87 },
  'Arab Emirates United':               { name: 'United Arab Emirates',        lat: 23.42,  lon: 53.85 },
  'Argentina':                          { name: 'Argentina',                   lat: -38.42, lon: -63.62 },
  'Armenia':                            { name: 'Armenia',                     lat: 40.07,  lon: 45.04 },
  'Australia':                          { name: 'Australia',                   lat: -25.27, lon: 133.78 },
  'Austria':                            { name: 'Austria',                     lat: 47.52,  lon: 14.55 },
  'Azerbaijan':                         { name: 'Azerbaijan',                  lat: 40.14,  lon: 47.58 },
  'Bahrain':                            { name: 'Bahrain',                     lat: 26.07,  lon: 50.56 },
  'Bangladesh':                         { name: 'Bangladesh',                  lat: 23.68,  lon: 90.36 },
  'Belarus':                            { name: 'Belarus',                     lat: 53.71,  lon: 27.95 },
  'Belgium':                            { name: 'Belgium',                     lat: 50.50,  lon: 4.47  },
  'Benin':                              { name: 'Benin',                       lat: 9.31,   lon: 2.32  },
  'Bolivia':                            { name: 'Bolivia',                     lat: -16.29, lon: -63.59 },
  'Bosnia and Herzegovina':             { name: 'Bosnia and Herzegovina',      lat: 43.92,  lon: 17.68 },
  'Brazil':                             { name: 'Brazil',                      lat: -14.24, lon: -51.93 },
  'Brunei Darussalam':                  { name: 'Brunei',                      lat: 4.54,   lon: 114.73 },
  'Bulgaria':                           { name: 'Bulgaria',                    lat: 42.73,  lon: 25.49 },
  'Burkina Faso':                       { name: 'Burkina Faso',                lat: 12.24,  lon: -1.56 },
  'Cambodia':                           { name: 'Cambodia',                    lat: 12.57,  lon: 104.99 },
  'Cameroon':                           { name: 'Cameroon',                    lat: 7.37,   lon: 12.35 },
  'Canada':                             { name: 'Canada',                      lat: 56.13,  lon: -106.35 },
  'Cape Verde':                         { name: 'Cabo Verde',                  lat: 16.00,  lon: -24.01 },
  'Chile':                              { name: 'Chile',                       lat: -35.68, lon: -71.54 },
  'China':                              { name: 'China',                       lat: 35.86,  lon: 104.20 },
  'Colombia':                           { name: 'Colombia',                    lat: 4.57,   lon: -74.30 },
  'Congo':                              { name: 'Congo',                       lat: -0.23,  lon: 15.83 },
  'Congo Democratic Republic of':       { name: 'DR Congo',                    lat: -4.04,  lon: 21.76 },
  'Costa Rica':                         { name: 'Costa Rica',                  lat: 9.75,   lon: -83.75 },
  'Croatia':                            { name: 'Croatia',                     lat: 45.10,  lon: 15.20 },
  'Czech Republic':                     { name: 'Czech Republic',              lat: 49.82,  lon: 15.47 },
  "C?te d'Ivoire":                      { name: "Côte d'Ivoire",               lat: 7.54,   lon: -5.55 },
  'Denmark':                            { name: 'Denmark',                     lat: 56.26,  lon: 9.50  },
  'Djibouti':                           { name: 'Djibouti',                    lat: 11.83,  lon: 42.59 },
  'Dominican Republic':                 { name: 'Dominican Republic',          lat: 18.74,  lon: -70.16 },
  'East Timor':                         { name: 'Timor-Leste',                 lat: -8.87,  lon: 125.73 },
  'Ecuador':                            { name: 'Ecuador',                     lat: -1.83,  lon: -78.18 },
  'Egypt':                              { name: 'Egypt',                       lat: 26.82,  lon: 30.80 },
  'El Salvador':                        { name: 'El Salvador',                 lat: 13.79,  lon: -88.90 },
  'Eritrea':                            { name: 'Eritrea',                     lat: 15.18,  lon: 39.78 },
  'Estonia':                            { name: 'Estonia',                     lat: 58.60,  lon: 25.01 },
  'Eswatini':                           { name: 'Eswatini',                    lat: -26.52, lon: 31.47 },
  'Ethiopia':                           { name: 'Ethiopia',                    lat: 9.15,   lon: 40.49 },
  'Fiji':                               { name: 'Fiji',                        lat: -17.71, lon: 178.07 },
  'Finland':                            { name: 'Finland',                     lat: 61.92,  lon: 25.75 },
  'France':                             { name: 'France',                      lat: 46.23,  lon: 2.21  },
  'Gambia':                             { name: 'Gambia',                      lat: 13.44,  lon: -15.31 },
  'Georgia':                            { name: 'Georgia',                     lat: 42.32,  lon: 43.36 },
  'Germany':                            { name: 'Germany',                     lat: 51.17,  lon: 10.45 },
  'Ghana':                              { name: 'Ghana',                       lat: 7.95,   lon: -1.02 },
  'Greece':                             { name: 'Greece',                      lat: 39.07,  lon: 21.82 },
  'Guatemala':                          { name: 'Guatemala',                   lat: 15.78,  lon: -90.23 },
  'Guinea':                             { name: 'Guinea',                      lat: 9.95,   lon: -9.70 },
  'Guyana':                             { name: 'Guyana',                      lat: 4.86,   lon: -58.93 },
  'Haiti':                              { name: 'Haiti',                       lat: 18.97,  lon: -72.29 },
  'Honduras':                           { name: 'Honduras',                    lat: 15.20,  lon: -86.24 },
  'Hong Kong':                          { name: 'Hong Kong',                   lat: 22.40,  lon: 114.11 },
  'Hungary':                            { name: 'Hungary',                     lat: 47.16,  lon: 19.50 },
  'Iceland':                            { name: 'Iceland',                     lat: 64.96,  lon: -19.02 },
  'India':                              { name: 'India',                       lat: 20.59,  lon: 78.96 },
  'Indonesia':                          { name: 'Indonesia',                   lat: -0.79,  lon: 113.92 },
  'Iraq':                               { name: 'Iraq',                        lat: 33.22,  lon: 43.68 },
  'Ireland':                            { name: 'Ireland',                     lat: 53.14,  lon: -7.69 },
  'Islamic Republic of Iran':           { name: 'Iran',                        lat: 32.43,  lon: 53.69 },
  'Israel':                             { name: 'Israel',                      lat: 31.05,  lon: 34.85 },
  'Italy':                              { name: 'Italy',                       lat: 41.87,  lon: 12.57 },
  'Cyprus':                             { name: 'Cyprus',                      lat: 35.13,  lon: 33.43 },
  'Jamaica':                            { name: 'Jamaica',                     lat: 18.11,  lon: -77.30 },
  'Japan':                              { name: 'Japan',                       lat: 36.20,  lon: 138.25 },
  'Jordan':                             { name: 'Jordan',                      lat: 30.59,  lon: 36.24 },
  'Kazakhstan':                         { name: 'Kazakhstan',                  lat: 48.02,  lon: 66.92 },
  'Kenya':                              { name: 'Kenya',                       lat: -0.02,  lon: 37.91 },
  'Korea Republic of':                  { name: 'South Korea',                 lat: 35.91,  lon: 127.77 },
  'Kuwait':                             { name: 'Kuwait',                      lat: 29.31,  lon: 47.48 },
  'Kyrgyzstan':                         { name: 'Kyrgyzstan',                  lat: 41.20,  lon: 74.77 },
  "Lao People's Democratic Republic":   { name: 'Laos',                        lat: 19.86,  lon: 102.50 },
  'Latvia':                             { name: 'Latvia',                      lat: 56.88,  lon: 24.60 },
  'Lebanon':                            { name: 'Lebanon',                     lat: 33.85,  lon: 35.86 },
  'Lesotho':                            { name: 'Lesotho',                     lat: -29.61, lon: 28.23 },
  'Liberia':                            { name: 'Liberia',                     lat: 6.43,   lon: -9.43 },
  'Libya':                              { name: 'Libya',                       lat: 26.34,  lon: 17.23 },
  'Liechtenstein':                      { name: 'Liechtenstein',               lat: 47.17,  lon: 9.56  },
  'Lithuania':                          { name: 'Lithuania',                   lat: 55.17,  lon: 23.88 },
  'Luxembourg':                         { name: 'Luxembourg',                  lat: 49.82,  lon: 6.13  },
  'Macao':                              { name: 'Macao',                       lat: 22.20,  lon: 113.54 },
  'Madagascar':                         { name: 'Madagascar',                  lat: -18.77, lon: 46.87 },
  'Malawi':                             { name: 'Malawi',                      lat: -13.25, lon: 34.30 },
  'Malaysia':                           { name: 'Malaysia',                    lat: 4.21,   lon: 101.98 },
  'Maldives':                           { name: 'Maldives',                    lat: 3.20,   lon: 73.22 },
  'Mali':                               { name: 'Mali',                        lat: 17.57,  lon: -4.00 },
  'Malta':                              { name: 'Malta',                       lat: 35.94,  lon: 14.38 },
  'Mauritania':                         { name: 'Mauritania',                  lat: 21.01,  lon: -10.94 },
  'Mauritius':                          { name: 'Mauritius',                   lat: -20.35, lon: 57.55 },
  'Mexico':                             { name: 'Mexico',                      lat: 23.63,  lon: -102.55 },
  'Moldova Republic of':                { name: 'Moldova',                     lat: 47.41,  lon: 28.37 },
  'Mongolia':                           { name: 'Mongolia',                    lat: 46.86,  lon: 103.85 },
  'Montenegro':                         { name: 'Montenegro',                  lat: 42.71,  lon: 19.37 },
  'Morocco':                            { name: 'Morocco',                     lat: 31.79,  lon: -7.09 },
  'Mozambique':                         { name: 'Mozambique',                  lat: -18.67, lon: 35.53 },
  'Myanmar':                            { name: 'Myanmar',                     lat: 21.91,  lon: 95.96 },
  'Namibia':                            { name: 'Namibia',                     lat: -22.96, lon: 18.49 },
  'Nepal':                              { name: 'Nepal',                       lat: 28.39,  lon: 84.12 },
  'Netherlands':                        { name: 'Netherlands',                 lat: 52.13,  lon: 5.29  },
  'New Zealand':                        { name: 'New Zealand',                 lat: -40.90, lon: 174.89 },
  'Nicaragua':                          { name: 'Nicaragua',                   lat: 12.87,  lon: -85.21 },
  'Niger':                              { name: 'Niger',                       lat: 17.61,  lon: 8.08  },
  'Nigeria':                            { name: 'Nigeria',                     lat: 9.08,   lon: 8.68  },
  'North Macedonia':                    { name: 'North Macedonia',             lat: 41.51,  lon: 21.75 },
  'Norway':                             { name: 'Norway',                      lat: 60.47,  lon: 8.47  },
  'Oman':                               { name: 'Oman',                        lat: 21.47,  lon: 55.98 },
  'Pakistan':                           { name: 'Pakistan',                    lat: 30.38,  lon: 69.35 },
  'Palestine State of':                 { name: 'Palestine',                   lat: 31.95,  lon: 35.23 },
  'Panama':                             { name: 'Panama',                      lat: 8.54,   lon: -80.78 },
  'Papua New Guinea':                   { name: 'Papua New Guinea',            lat: -6.31,  lon: 143.96 },
  'Paraguay':                           { name: 'Paraguay',                    lat: -23.44, lon: -58.44 },
  'Peru':                               { name: 'Peru',                        lat: -9.19,  lon: -75.02 },
  'Philippines':                        { name: 'Philippines',                 lat: 12.88,  lon: 121.77 },
  'Poland':                             { name: 'Poland',                      lat: 51.92,  lon: 19.15 },
  'Portugal':                           { name: 'Portugal',                    lat: 39.40,  lon: -8.22 },
  'Qatar':                              { name: 'Qatar',                       lat: 25.35,  lon: 51.18 },
  'Romania':                            { name: 'Romania',                     lat: 45.94,  lon: 24.97 },
  'Russian Federation':                 { name: 'Russia',                      lat: 61.52,  lon: 105.32 },
  'Rwanda':                             { name: 'Rwanda',                      lat: -1.94,  lon: 29.87 },
  'Saudi Arabia':                       { name: 'Saudi Arabia',                lat: 23.89,  lon: 45.08 },
  'Senegal':                            { name: 'Senegal',                     lat: 14.50,  lon: -14.45 },
  'Serbia':                             { name: 'Serbia',                      lat: 44.02,  lon: 21.01 },
  'Seychelles':                         { name: 'Seychelles',                  lat: -4.68,  lon: 55.49 },
  'Sierra Leone':                       { name: 'Sierra Leone',                lat: 8.46,   lon: -11.78 },
  'Singapore':                          { name: 'Singapore',                   lat: 1.35,   lon: 103.82 },
  'Slovakia':                           { name: 'Slovakia',                    lat: 48.67,  lon: 19.70 },
  'Slovenia':                           { name: 'Slovenia',                    lat: 46.15,  lon: 14.99 },
  'Somalia':                            { name: 'Somalia',                     lat: 5.15,   lon: 46.20 },
  'South Africa':                       { name: 'South Africa',                lat: -30.56, lon: 22.94 },
  'Spain':                              { name: 'Spain',                       lat: 40.46,  lon: -3.75 },
  'Sri Lanka':                          { name: 'Sri Lanka',                   lat: 7.87,   lon: 80.77 },
  'Sudan':                              { name: 'Sudan',                       lat: 12.86,  lon: 30.22 },
  'Suriname':                           { name: 'Suriname',                    lat: 3.92,   lon: -56.03 },
  'Sweden':                             { name: 'Sweden',                      lat: 60.13,  lon: 18.64 },
  'Switzerland':                        { name: 'Switzerland',                 lat: 46.82,  lon: 8.23  },
  'Syrian Arab Republic':               { name: 'Syria',                       lat: 34.80,  lon: 38.99 },
  'T?rkiye':                            { name: 'Türkiye',                     lat: 38.96,  lon: 35.24 },
  'Tanzania United Republic of':        { name: 'Tanzania',                    lat: -6.37,  lon: 34.89 },
  'Thailand':                           { name: 'Thailand',                    lat: 15.87,  lon: 100.99 },
  'Togo':                               { name: 'Togo',                        lat: 8.62,   lon: 0.82  },
  'Trinidad and Tobago':                { name: 'Trinidad and Tobago',         lat: 10.69,  lon: -61.22 },
  'Tunisia':                            { name: 'Tunisia',                     lat: 33.89,  lon: 9.54  },
  'Uganda':                             { name: 'Uganda',                      lat: 1.37,   lon: 32.29 },
  'Ukraine':                            { name: 'Ukraine',                     lat: 48.38,  lon: 31.17 },
  'United Kingdom':                     { name: 'United Kingdom',              lat: 55.38,  lon: -3.44 },
  'United States':                      { name: 'United States',               lat: 37.09,  lon: -95.71 },
  'Uruguay':                            { name: 'Uruguay',                     lat: -32.52, lon: -55.77 },
  'Uzbekistan':                         { name: 'Uzbekistan',                  lat: 41.38,  lon: 64.59 },
  'Venezuela':                          { name: 'Venezuela',                   lat: 6.42,   lon: -66.59 },
  'Viet Nam':                           { name: 'Vietnam',                     lat: 14.06,  lon: 108.28 },
  'Yemen':                              { name: 'Yemen',                       lat: 15.55,  lon: 48.52 },
  'Zimbabwe':                           { name: 'Zimbabwe',                    lat: -19.02, lon: 29.15 },
};

// Skip these — Taiwan itself or unmappable
const SKIP = new Set([
  'Taiwan ROC', 'Others', 'American Samoa', 'Guam', 'Northern Mariana Islands',
  'Andorra', 'Aruba', 'Bahamas', 'Barbados', 'Belize', 'Cayman Islands',
  'Cocos Keeling Islands', 'Comoros', 'Cook Islands', 'Curacao', 'Dominica',
  'Federated States of Micronesia', 'French Polynesia', 'Grenada',
  'Indian Ocean Territory British', 'Isle of Man', 'Kiribati',
  'Marshall Islands', 'Monaco', 'Nauru', 'New Caledonia', 'Palau',
  'Puerto Rico', 'Reunion', 'Saint Helena Ascension and Tristan da Cunha',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Samoa', 'Sao Tome and Principe',
  'Solomon Islands', 'Tahiti', 'Tokelau', 'Tonga', 'Tuvalu',
  'U.S. Virgin Islands', 'Vanuatu', 'Virgin Islands British',
]);

const FILES = [
  'Total+Imports(Exports)_20260507061950.csv',  // 2025 H1
  'Total+Imports(Exports)_20260507062018.csv',  // 2025 H2
  'Total+Imports(Exports)_20260506204649.csv',  // 2026 Q1
];

// key: "year|direction|country|code" → value (USD thousands accumulated)
const agg = new Map();
const skipped = new Set();

for (const file of FILES) {
  const text = readFileSync(join(RAW, file), 'utf8');
  const lines = text.split('\n');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV: direction,time,code,description,country,value
    const parts = line.split(',');
    if (parts.length < 6) continue;

    const direction = parts[0].trim();
    const time = parts[1].trim();           // e.g. "2025/3", "2026/1"
    const code = parts[2].trim();
    // description is parts[3], country is parts[4], value is parts[5]
    // BUT description may itself contain commas — find country by scanning backwards
    const value = parseFloat(parts[parts.length - 1]);
    const country = parts[parts.length - 2].trim();
    const description = parts.slice(3, parts.length - 2).join(',').trim().replace(/^ /, '');

    if (!direction || !time || !code || !country || isNaN(value)) continue;

    const year = time.startsWith('2026') ? '2026' : '2025';

    if (SKIP.has(country)) { skipped.add(country); continue; }
    if (!COORD_MAP[country]) { skipped.add(country); continue; }

    const key = `${year}|${direction}|${country}|${code}`;
    agg.set(key, (agg.get(key) || { description, value: 0 }));
    agg.get(key).value += value;
  }
}

// Build per-year record arrays
const yearRecords = { '2025': [], '2026': [] };

for (const [key, entry] of agg) {
  const [year, direction, csvCountry, code] = key.split('|');
  const coord = COORD_MAP[csvCountry];

  yearRecords[year].push({
    direction,
    country: coord.name,
    code,
    description: entry.description.replace(/^ Chapter \d+ /, ''),
    value: Math.round(entry.value * 1000),  // convert thousands → USD
    lat: coord.lat,
    lon: coord.lon
  });
}

const output = {
  years: {
    '2025': {
      label: 'Full Year 2025',
      records: yearRecords['2025']
    },
    '2026': {
      label: 'Jan–Mar 2026 (Preliminary)',
      records: yearRecords['2026']
    }
  }
};

writeFileSync(OUT, JSON.stringify(output));

const r25 = yearRecords['2025'].length;
const r26 = yearRecords['2026'].length;
console.log(`Written: ${OUT}`);
console.log(`  2025: ${r25} records`);
console.log(`  2026: ${r26} records`);
console.log(`  Skipped countries: ${[...skipped].sort().join(', ')}`);
