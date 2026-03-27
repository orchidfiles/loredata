import { PersonaBuilder } from '@/engine';

import type { Person, UniverseMeta, PersonOptions, GroupOptions, UniverseData } from '@/types';

export function person(options: PersonOptions): Person {
	return PersonaBuilder.buildPerson(options);
}

export function personFromData(universe: UniverseData, seed?: number): Person {
	return PersonaBuilder.buildPersonFromData(universe, { seed });
}

export function group(options: GroupOptions): Person[] {
	return PersonaBuilder.buildGroup(options);
}

export function universes(): UniverseMeta[] {
	return PersonaBuilder.listUniverses();
}

export { UniverseLoader } from '@/universes';
export { UniverseStore, PersonFactory } from '@/engine';

export type { Person, UniverseMeta, PersonOptions, GroupOptions } from '@/types';
export type { Address, UniverseData, CharacterData, AddressData } from '@/types';
export type { CharacterEntry, CharacterQuery, LocationEntry, LocationType } from '@/types';
