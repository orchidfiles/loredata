import { error } from '@sveltejs/kit';
import { UniverseLoader } from 'loredata';

import type { PageServerLoad, EntryGenerator } from './$types';
import type { UniverseData } from 'loredata';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const ids = UniverseLoader.listAvailable();

	return ids.map((id) => ({ slug: id }));
};

export const load: PageServerLoad = ({ params }) => {
	const ids = UniverseLoader.listAvailable();

	if (!ids.includes(params.slug)) {
		error(404, `Universe "${params.slug}" not found`);
	}

	const universe = UniverseLoader.load(params.slug);

	const data: { universe: UniverseData } = { universe };

	return data;
};
