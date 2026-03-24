import { UniverseStore } from 'loredata/browser';

import type { UniverseData, CharacterData, AddressData, DomainsData } from 'loredata/browser';

interface MetaJson {
	id: string;
	name: string;
	genre: string[];
	description: string;
}

const metaFiles = import.meta.glob('$data/*/meta.json', { eager: true });
const characterFiles = import.meta.glob('$data/*/characters.json', { eager: true });
const addressFiles = import.meta.glob('$data/*/addresses.json', { eager: true });
const domainFiles = import.meta.glob('$data/*/domains.json', { eager: true });

function extractId(path: string): string {
	const parts = path.split('/');

	return parts[parts.length - 2];
}

function buildUniverses(): UniverseData[] {
	const result: UniverseData[] = [];

	for (const metaPath of Object.keys(metaFiles)) {
		const id = extractId(metaPath);
		const basePath = metaPath.replace('/meta.json', '');

		const metaModule = metaFiles[metaPath] as { default: MetaJson };
		const charactersModule = characterFiles[`${basePath}/characters.json`] as {
			default: CharacterData[];
		};
		const addressesModule = addressFiles[`${basePath}/addresses.json`] as {
			default: AddressData[];
		};
		const domainsModule = domainFiles[`${basePath}/domains.json`] as { default: DomainsData };

		if (!metaModule || !charactersModule || !addressesModule || !domainsModule) {
			continue;
		}

		const universe: UniverseData = {
			id,
			name: metaModule.default.name,
			genre: metaModule.default.genre,
			description: metaModule.default.description,
			characters: charactersModule.default,
			addresses: addressesModule.default,
			domains: domainsModule.default
		};

		result.push(universe);
	}

	return result;
}

export const store = new UniverseStore(buildUniverses());
