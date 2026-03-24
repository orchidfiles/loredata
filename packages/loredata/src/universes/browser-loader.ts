import type { UniverseData, UniverseMeta, CharacterData, AddressData, DomainsData } from '@/types';

interface MetaJson {
	id: string;
	name: string;
	genre: string[];
	description: string;
}

const metaModules = import.meta.glob('../data/*/meta.json', { eager: false });
const characterModules = import.meta.glob('../data/*/characters.json', { eager: false });
const addressModules = import.meta.glob('../data/*/addresses.json', { eager: false });
const domainModules = import.meta.glob('../data/*/domains.json', { eager: false });

function extractId(path: string): string {
	const parts = path.split('/');

	return parts[parts.length - 2];
}

export function getAvailableIds(): string[] {
	return Object.keys(metaModules).map(extractId);
}

export async function loadUniverseMeta(id: string): Promise<UniverseMeta> {
	const metaPath = `../data/${id}/meta.json`;
	const metaLoader = metaModules[metaPath];

	if (!metaLoader) {
		throw new Error(`Universe "${id}" not found`);
	}

	const metaModule = await metaLoader();
	const meta = (metaModule as { default: MetaJson }).default;

	const result: UniverseMeta = {
		id: meta.id,
		name: meta.name,
		genre: meta.genre,
		description: meta.description
	};

	return result;
}

export async function getManifest(): Promise<UniverseMeta[]> {
	const ids = getAvailableIds();
	const result = await Promise.all(ids.map((id) => loadUniverseMeta(id)));

	return result;
}

export async function loadUniverse(id: string): Promise<UniverseData> {
	const metaPath = `../data/${id}/meta.json`;
	const charactersPath = `../data/${id}/characters.json`;
	const addressesPath = `../data/${id}/addresses.json`;
	const domainsPath = `../data/${id}/domains.json`;

	const metaLoader = metaModules[metaPath];
	const charactersLoader = characterModules[charactersPath];
	const addressesLoader = addressModules[addressesPath];
	const domainsLoader = domainModules[domainsPath];

	if (!metaLoader || !charactersLoader || !addressesLoader || !domainsLoader) {
		throw new Error(`Universe "${id}" not found`);
	}

	const [metaModule, charactersModule, addressesModule, domainsModule] = await Promise.all([
		metaLoader(),
		charactersLoader(),
		addressesLoader(),
		domainsLoader()
	]);

	const meta = (metaModule as { default: MetaJson }).default;
	const characters = (charactersModule as { default: CharacterData[] }).default;
	const addresses = (addressesModule as { default: AddressData[] }).default;
	const domains = (domainsModule as { default: DomainsData }).default;

	const universeData: UniverseData = {
		id: meta.id,
		name: meta.name,
		genre: meta.genre,
		description: meta.description,
		characters,
		addresses,
		domains
	};

	return universeData;
}

export async function loadUniverses(ids: string[]): Promise<UniverseData[]> {
	const result = await Promise.all(ids.map((id) => loadUniverse(id)));

	return result;
}

export async function loadAllUniverses(): Promise<UniverseData[]> {
	const ids = getAvailableIds();

	return loadUniverses(ids);
}

export async function getAllInterests(): Promise<string[]> {
	const universes = await loadAllUniverses();
	const interestSet = new Set<string>();

	for (const universe of universes) {
		for (const character of universe.characters) {
			for (const interest of character.interests) {
				interestSet.add(interest);
			}
		}
	}

	const result = Array.from(interestSet).sort();

	return result;
}

export async function getAllLocations(): Promise<string[]> {
	const universes = await loadAllUniverses();
	const citySet = new Set<string>();

	for (const universe of universes) {
		for (const address of universe.addresses) {
			if (address.city) {
				citySet.add(address.city);
			}
		}
	}

	const result = Array.from(citySet).sort();

	return result;
}
