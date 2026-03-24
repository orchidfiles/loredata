import { createRng } from '@/generators';

import { PersonFactory } from './person-factory';

import type { UniverseData, UniverseMeta, Person, CharacterEntry, CharacterQuery } from '@/types';

export class UniverseStore {
	private universes: UniverseData[];
	private characterIndex: CharacterEntry[];

	constructor(universes: UniverseData[]) {
		this.universes = universes;
		this.characterIndex = this.buildIndex(universes);
	}

	get index(): CharacterEntry[] {
		return this.characterIndex;
	}

	getInterests(universeIds?: string[]): string[] {
		const entries =
			universeIds && universeIds.length > 0
				? this.characterIndex.filter((e) => universeIds.includes(e.universeId))
				: this.characterIndex;

		const interestSet = new Set<string>();

		for (const entry of entries) {
			for (const interest of entry.interests) {
				interestSet.add(interest);
			}
		}

		const result = Array.from(interestSet).sort();

		return result;
	}

	getUniverses(): UniverseMeta[] {
		const result = this.universes.map((u) => {
			const meta: UniverseMeta = {
				id: u.id,
				name: u.name,
				genre: u.genre,
				description: u.description
			};

			return meta;
		});

		return result;
	}

	findCharacters(query: CharacterQuery): CharacterEntry[] {
		let entries = this.characterIndex;

		if (query.universes && query.universes.length > 0) {
			entries = entries.filter((e) => query.universes!.includes(e.universeId));
		}

		if (query.name && query.name.trim().length > 0) {
			const needle = query.name.toLowerCase();

			entries = entries.filter((e) => {
				const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();

				return fullName.includes(needle);
			});
		}

		if (query.interests && query.interests.length > 0) {
			const mode = query.interestsMode ?? 'or';

			if (mode === 'and') {
				entries = entries.filter((e) => query.interests!.every((interest) => e.interests.includes(interest)));
			} else {
				entries = entries.filter((e) => query.interests!.some((interest) => e.interests.includes(interest)));
			}
		}

		return entries;
	}

	personByCharacterId(characterId: string, seed?: number): Person {
		const entry = this.characterIndex.find((e) => e.characterId === characterId);

		if (!entry) {
			throw new Error(`Character "${characterId}" not found in store`);
		}

		const universe = this.universes.find((u) => u.id === entry.universeId);

		if (!universe) {
			throw new Error(`Universe "${entry.universeId}" not found in store`);
		}

		return PersonFactory.buildByCharacterId(characterId, universe, seed);
	}

	generatePersonas(query: CharacterQuery, count: number, seed?: number): Person[] {
		const matching = this.findCharacters(query);

		if (matching.length === 0) {
			return [];
		}

		const rng = createRng(seed);
		const actualCount = Math.min(count, matching.length);

		const shuffled = [...matching].sort(() => rng() - 0.5);
		const selected = shuffled.slice(0, actualCount);
		const personas: Person[] = [];

		for (let i = 0; i < selected.length; i++) {
			const entry = selected[i];
			const universe = this.universes.find((u) => u.id === entry.universeId)!;
			const personSeed = seed !== undefined ? seed + i : undefined;

			personas.push(PersonFactory.buildByCharacterId(entry.characterId, universe, personSeed));
		}

		return personas;
	}

	private buildIndex(universes: UniverseData[]): CharacterEntry[] {
		const index: CharacterEntry[] = [];

		for (const universe of universes) {
			for (const character of universe.characters) {
				const entry: CharacterEntry = {
					characterId: character.id,
					universeId: universe.id,
					universeName: universe.name,
					firstName: character.firstName,
					lastName: character.lastName,
					interests: character.interests,
					profession: character.profession
				};

				index.push(entry);
			}
		}

		return index;
	}
}
