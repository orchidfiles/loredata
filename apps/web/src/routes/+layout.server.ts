import { UniverseLoader } from 'loredata';

import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = () => {
	const manifest = UniverseLoader.getManifest();

	return { manifest };
};
