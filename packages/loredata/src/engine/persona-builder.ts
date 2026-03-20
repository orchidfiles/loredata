import { UniverseLoader } from '@/universes';

import { PersonFactory } from './person-factory';

import type { Person, PersonOptions, GroupOptions, UniverseInfo, UniverseData } from '@/types';

export class PersonaBuilder {
	static buildPersonFromData(universe: UniverseData, options: Omit<PersonOptions, 'universe'>): Person {
		return PersonFactory.build(universe, options.seed);
	}

	static buildPerson(options: PersonOptions): Person {
		const universe = UniverseLoader.load(options.universe);

		return PersonFactory.build(universe, options.seed);
	}

	static buildGroup(options: GroupOptions): Person[] {
		const persons: Person[] = [];

		for (let i = 0; i < options.size; i++) {
			const seed = options.seed !== undefined ? options.seed + i : undefined;

			persons.push(this.buildPerson({ universe: options.universe, seed }));
		}

		return persons;
	}

	static listUniverses(): UniverseInfo[] {
		const ids = UniverseLoader.listAvailable();

		const result: UniverseInfo[] = ids.map((id) => {
			const data = UniverseLoader.load(id);

			const info: UniverseInfo = {
				id,
				name: data.name,
				characterCount: data.characters.length
			};

			return info;
		});

		return result;
	}
}
