import { createRng, pickRandom, EmailGenerator } from '@/generators';

import type { Person, UniverseData, CharacterData } from '@/types';

export class PersonFactory {
	static build(universe: UniverseData, seed?: number): Person {
		const rng = createRng(seed);

		const character = pickRandom(universe.characters, rng);

		return this.buildFromCharacter(character, universe, rng);
	}

	static buildByCharacterId(characterId: string, universe: UniverseData, seed?: number): Person {
		const character = universe.characters.find((c) => c.id === characterId);

		if (!character) {
			throw new Error(`Character "${characterId}" not found in universe "${universe.id}"`);
		}

		const rng = createRng(seed);

		return this.buildFromCharacter(character, universe, rng);
	}

	static buildCanonical(characterId: string, universe: UniverseData): Person {
		const character = universe.characters.find((c) => c.id === characterId);

		if (!character) {
			throw new Error(`Character "${characterId}" not found in universe "${universe.id}"`);
		}

		const address = character.address ?? universe.addresses[0];
		const username = character.usernames[0];
		const rng = createRng(0);
		const emailUsername = this.pickEmailUsername(character.usernames, username, rng);
		const email = EmailGenerator.generateFromUsername(emailUsername, character.emailDomains, rng);
		const quote = character.quotes[0];

		const person: Person = {
			id: crypto.randomUUID(),
			characterId: character.id,
			firstName: character.firstName,
			lastName: character.lastName,
			username,
			email,
			address: {
				street: address.street,
				city: address.city,
				state: address.state ?? '',
				zip: address.zip ?? '',
				country: address.country
			},
			profession: character.profession,
			interests: character.interests,
			quote,
			universe: universe.id,
			universeName: universe.name,
			...(character.symbol ? { symbol: character.symbol } : {}),
			...(character.color ? { color: character.color } : {})
		};

		return person;
	}

	private static buildFromCharacter(character: CharacterData, universe: UniverseData, rng: () => number): Person {
		const address = character.address ?? pickRandom(universe.addresses, rng);
		const username = pickRandom(character.usernames, rng);
		const emailUsername = this.pickEmailUsername(character.usernames, username, rng);
		const email = EmailGenerator.generateFromUsername(emailUsername, character.emailDomains, rng);
		const quote = pickRandom(character.quotes, rng);

		const person: Person = {
			id: crypto.randomUUID(),
			characterId: character.id,
			firstName: character.firstName,
			lastName: character.lastName,
			username,
			email,
			address: {
				street: address.street,
				city: address.city,
				state: address.state ?? '',
				zip: address.zip ?? '',
				country: address.country
			},
			profession: character.profession,
			interests: character.interests,
			quote,
			universe: universe.id,
			universeName: universe.name,
			...(character.symbol ? { symbol: character.symbol } : {}),
			...(character.color ? { color: character.color } : {})
		};

		return person;
	}

	private static pickEmailUsername(usernames: string[], selectedUsername: string, rng: () => number): string {
		const alternativeUsernames = usernames.filter((username) => username !== selectedUsername);

		if (alternativeUsernames.length === 0) {
			return selectedUsername;
		}

		return pickRandom(alternativeUsernames, rng);
	}
}
