import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const content = `User-agent: *
Allow: /

Sitemap: https://loredata.orchidfiles.com/sitemap.xml
`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
