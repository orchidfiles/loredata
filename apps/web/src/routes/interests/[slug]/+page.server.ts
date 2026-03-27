import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import { slugify } from '$shared/utils';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { CharacterData, UniverseMeta } from 'loredata';

export const prerender = true;

function buildSlugMap(): Map<string, string> {
	const interests = UniverseLoader.getAllInterests();
	const map = new Map<string, string>();

	for (const interest of interests) {
		map.set(slugify(interest), interest);
	}

	return map;
}

export const entries: EntryGenerator = () => {
	const interests = UniverseLoader.getAllInterests();

	return interests.map((interest) => ({ slug: slugify(interest) }));
};

export interface CharacterWithUniverse extends CharacterData {
	universe: UniverseMeta;
}

export const load: PageServerLoad = ({ params }) => {
	const slugMap = buildSlugMap();
	const interest = slugMap.get(params.slug);

	if (!interest) {
		error(404, `Interest "${params.slug}" not found`);
	}

	const allUniverses = UniverseLoader.listAvailable().map((id) => UniverseLoader.load(id));

	const characters: CharacterWithUniverse[] = allUniverses.flatMap((u) =>
		u.characters
			.filter((c) => c.interests.includes(interest))
			.map((c) => ({
				...c,
				universe: { id: u.id, name: u.name, genre: u.genre, description: u.description }
			}))
	);

	if (characters.length === 0) {
		error(404, `Interest "${interest}" not found`);
	}

	return { interest, characters };
};
