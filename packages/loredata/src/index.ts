import { PersonaBuilder } from '@/engine';

import type { Person, UniverseInfo, PersonOptions, GroupOptions, UniverseData } from '@/types';

export function person(options: PersonOptions): Person {
	return PersonaBuilder.buildPerson(options);
}

export function personFromData(universe: UniverseData, seed?: number): Person {
	return PersonaBuilder.buildPersonFromData(universe, { seed });
}

export function group(options: GroupOptions): Person[] {
	return PersonaBuilder.buildGroup(options);
}

export function universes(): UniverseInfo[] {
	return PersonaBuilder.listUniverses();
}

export { UniverseLoader } from '@/universes';
export { UniverseStore } from '@/engine';

export type { Person, UniverseInfo, PersonOptions, GroupOptions } from '@/types';
export type { Address, UniverseData, CharacterData, AddressData, DomainsData } from '@/types';
export type { CharacterEntry, CharacterQuery } from '@/types';
