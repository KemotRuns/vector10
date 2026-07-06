export interface RegMilestone {
	year: string;
	title: string;
	detail: string;
	status: 'live' | 'imminent' | 'ahead';
}

export const REG_TIMELINE: RegMilestone[] = [
	{
		year: '2024',
		title: 'CSRD wave 1 reporting begins',
		detail:
			'Large EU companies report FY2024 under the Corporate Sustainability Reporting Directive — and start demanding value-chain data from their suppliers.',
		status: 'live'
	},
	{
		year: '2025',
		title: 'Textile EPR spreads across the EU',
		detail:
			'France (since 2007) is joined by the Netherlands and Latvia with live textile Extended Producer Responsibility schemes; Hungary operates a related system.',
		status: 'live'
	},
	{
		year: '2026',
		title: 'EU-wide textile EPR window opens',
		detail:
			'The revised Waste Framework Directive obliges every EU member state to set up textile EPR — fees will increasingly depend on eco-modulation criteria.',
		status: 'imminent'
	},
	{
		year: '2027',
		title: 'ESPR delegated act for textiles',
		detail:
			'The Ecodesign for Sustainable Products Regulation is expected to adopt its first textile-specific requirements; Digital Product Passport pilots scale up.',
		status: 'ahead'
	},
	{
		year: '2028+',
		title: 'Digital Product Passports become mandatory',
		detail:
			'Apparel placed on the EU market will need machine-readable passports covering origin, composition and circularity — traceability becomes a market-access requirement.',
		status: 'ahead'
	}
];
