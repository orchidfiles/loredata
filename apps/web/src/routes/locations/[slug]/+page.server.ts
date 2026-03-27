import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import { slugify } from '$shared/utils';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { UniverseMeta, LocationEntry, LocationType } from 'loredata';

export const prerender = true;

export interface UniverseWithLocation {
	universe: UniverseMeta;
	characterCount: number;
}

function buildSlugMap(): Map<string, LocationEntry> {
	const locations = UniverseLoader.getAllLocations();
	const map = new Map<string, LocationEntry>();

	for (const loc of locations) {
		map.set(slugify(loc.name), loc);
	}

	return map;
}

function matchesLocation(a: { city?: string; state?: string; country?: string }, name: string, type: LocationType): boolean {
	if (type === 'city') return a.city === name;
	if (type === 'state') return a.state === name;

	return a.country === name;
}

export const entries: EntryGenerator = () => {
	const locations = UniverseLoader.getAllLocations();

	return locations.map((loc) => ({ slug: slugify(loc.name) }));
};

export const load: PageServerLoad = ({ params }) => {
	const slugMap = buildSlugMap();
	const entry = slugMap.get(params.slug);

	if (!entry) {
		error(404, `Location "${params.slug}" not found`);
	}

	const allUniverses = UniverseLoader.listAvailable().map((id) => UniverseLoader.load(id));

	const matches: UniverseWithLocation[] = allUniverses
		.filter((u) => u.addresses.some((a) => matchesLocation(a, entry.name, entry.type)))
		.map((u) => ({
			universe: {
				id: u.id,
				name: u.name,
				genre: u.genre,
				description: u.description,
				year: u.year,
				rating: u.rating,
				mediaType: u.mediaType,
				networks: u.networks,
				posterPath: u.posterPath,
				backdropPath: u.backdropPath
			},
			characterCount: u.characters.length
		}));

	if (matches.length === 0) {
		error(404, `Location "${entry.name}" not found`);
	}

	return { location: entry.name, locationType: entry.type, universes: matches };
};
