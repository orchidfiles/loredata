import { PersonFactory } from '@/engine/person-factory';
import { UniverseStore } from '@/engine/universe-store';

import type { Person, UniverseData } from '@/types';

export { UniverseStore };
export {
	loadUniverse,
	loadUniverses,
	loadAllUniverses,
	loadUniverseMeta,
	getManifest,
	getAllInterests,
	getAllLocations,
	getAvailableIds
} from '@/universes/browser-loader';

export function personFromData(universe: UniverseData, seed?: number): Person {
	return PersonFactory.build(universe, seed);
}

export type { Person, UniverseMeta } from '@/types';
export type { Address, UniverseData, CharacterData, AddressData, DomainsData } from '@/types';
export type { CharacterEntry, CharacterQuery } from '@/types';
