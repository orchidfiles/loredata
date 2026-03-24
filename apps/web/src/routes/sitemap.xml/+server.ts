import { UniverseLoader } from 'loredata';

import type { RequestHandler } from './$types';

const SITE_URL = 'https://loredata.orchidfiles.com';

export const prerender = true;

export const GET: RequestHandler = () => {
	const ids = UniverseLoader.listAvailable();

	const staticRoutes = ['/'];

	const universeRoutes = ids.map((id) => `/universes/${id}`);

	const allRoutes = [...staticRoutes, ...universeRoutes];

	const urlEntries = allRoutes
		.map(
			(path) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
