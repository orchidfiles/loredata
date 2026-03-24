import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { UniverseData, CharacterData } from 'loredata';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const ids = UniverseLoader.listAvailable();
	const result: { slug: string; char: string }[] = [];

	for (const id of ids) {
		const universe = UniverseLoader.load(id);

		for (const character of universe.characters) {
			result.push({ slug: id, char: character.id });
		}
	}

	return result;
};

export const load: PageServerLoad = ({ params }) => {
	const ids = UniverseLoader.listAvailable();

	if (!ids.includes(params.slug)) {
		error(404, `Universe "${params.slug}" not found`);
	}

	const universe = UniverseLoader.load(params.slug);
	const character = universe.characters.find((c) => c.id === params.char);

	if (!character) {
		error(404, `Character "${params.char}" not found`);
	}

	const data: { universe: UniverseData; character: CharacterData } = { universe, character };

	return data;
};
