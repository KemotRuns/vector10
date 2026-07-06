const CONTACT_EMAIL = 'hello@vector-10.com';

export function buildLetsTalkHref(subject: string, body?: string): string {
	const params = new URLSearchParams({ subject });
	if (body) params.set('body', body);
	// URLSearchParams encodes spaces as '+', which mail clients render literally
	return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}
