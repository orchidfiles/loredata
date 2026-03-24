import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { CharacterData, UniverseMeta } from 'loredata';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const interests = UniverseLoader.getAllInterests();

	return interests.map((slug) => ({ slug }));
};

export interface CharacterWithUniverse extends CharacterData {
	universe: UniverseMeta;
}

export const load: PageServerLoad = ({ params }) => {
	const allUniverses = UniverseLoader.listAvailable().map((id) => UniverseLoader.load(id));
	const interest = params.slug;

	const characters: CharacterWithUniverse[] = allUniverses.flatMap((u) =>
		u.characters
			.filter((c) => c.interests.includes(interest))
			.map((c) => {
				const withUniverse: CharacterWithUniverse = {
					...c,
					universe: { id: u.id, name: u.name, genre: u.genre, description: u.description }
				};

				return withUniverse;
			})
	);

	if (characters.length === 0) {
		error(404, `Interest "${interest}" not found`);
	}

	return { interest, characters };
};
