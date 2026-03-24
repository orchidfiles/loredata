import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { UniverseMeta } from 'loredata';

export const prerender = true;

export interface UniverseWithLocation {
	universe: UniverseMeta;
	characterCount: number;
}

export const entries: EntryGenerator = () => {
	const locations = UniverseLoader.getAllLocations();

	return locations.map((slug) => ({ slug }));
};

export const load: PageServerLoad = ({ params }) => {
	const allUniverses = UniverseLoader.listAvailable().map((id) => UniverseLoader.load(id));
	const city = params.slug;

	const matches: UniverseWithLocation[] = allUniverses
		.filter((u) => u.addresses.some((a) => a.city === city))
		.map((u) => {
			const entry: UniverseWithLocation = {
				universe: { id: u.id, name: u.name, genre: u.genre, description: u.description },
				characterCount: u.characters.length
			};

			return entry;
		});

	if (matches.length === 0) {
		error(404, `Location "${city}" not found`);
	}

	return { city, universes: matches };
};
