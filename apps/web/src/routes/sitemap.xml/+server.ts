import { UniverseLoader } from 'loredata';

import { config } from '$shared/config';
import { slugify } from '$shared/utils';

import type { RequestHandler } from './$types';
import type { UniverseData } from 'loredata';

export const prerender = true;

interface LocationStats {
	universeIds: Set<string>;
}

interface InterestStats {
	characterCount: number;
}

function appendLocationStats(map: Map<string, LocationStats>, locationName: string | undefined, universeId: string): void {
	if (!locationName) {
		return;
	}

	const slug = slugify(locationName);
	const stats = map.get(slug) ?? { universeIds: new Set<string>() };

	stats.universeIds.add(universeId);
	map.set(slug, stats);
}

function collectLocationStats(universes: UniverseData[]): Map<string, LocationStats> {
	const map = new Map<string, LocationStats>();

	for (const universe of universes) {
		for (const address of universe.addresses) {
			appendLocationStats(map, address.city, universe.id);
			appendLocationStats(map, address.state, universe.id);
			appendLocationStats(map, address.country, universe.id);
		}
	}

	return map;
}

function collectInterestStats(universes: UniverseData[]): Map<string, InterestStats> {
	const map = new Map<string, InterestStats>();

	for (const universe of universes) {
		for (const character of universe.characters) {
			for (const interest of character.interests) {
				const slug = slugify(interest);
				const stats = map.get(slug) ?? { characterCount: 0 };

				stats.characterCount += 1;
				map.set(slug, stats);
			}
		}
	}

	return map;
}

function collectRoutes(universes: UniverseData[]): string[] {
	const staticRoutes = ['/'];
	const universeRoutes = universes.map((u) => `/universes/${u.id}`);
	const characterRoutes = universes.flatMap((u) => u.characters.map((c) => `/universes/${u.id}/${c.id}`));

	const locationRoutes = [...collectLocationStats(universes).entries()]
		.filter(([, stats]) => stats.universeIds.size >= 5)
		.map(([slug]) => `/locations/${slug}`);

	const interestRoutes = [...collectInterestStats(universes).entries()]
		.filter(([, stats]) => stats.characterCount >= 5)
		.map(([slug]) => `/interests/${slug}`);

	return [...staticRoutes, ...universeRoutes, ...characterRoutes, ...interestRoutes, ...locationRoutes]
		.filter((route) => route !== '/interests' && route !== '/locations')
		.sort((a, b) => a.localeCompare(b));
}

function buildXml(routes: string[]): string {
	const urlEntries = routes
		.map(
			(path) => `<url>
	<loc>${config.siteOrigin}${path}</loc>
</url>`
		)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;
}

export const GET: RequestHandler = () => {
	const ids = UniverseLoader.listAvailable();
	const universes = ids.map((id) => UniverseLoader.load(id));
	const routes = collectRoutes(universes);
	const xml = buildXml(routes);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
