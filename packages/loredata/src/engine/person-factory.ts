import { createRng, pickRandom, EmailGenerator, PhoneGenerator, PasswordGenerator } from '@/generators';

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

	private static buildFromCharacter(character: CharacterData, universe: UniverseData, rng: () => number): Person {
		const address = character.address ?? pickRandom(universe.addresses, rng);

		const username = pickRandom(character.usernames, rng);

		const domains = character.emailDomain ? { ...universe.domains, emailDomains: [character.emailDomain] } : universe.domains;

		const email = EmailGenerator.generateFromUsername(username, domains, rng);
		const phone = PhoneGenerator.generate(universe.domains, rng);
		const password = PasswordGenerator.generate(universe.domains, rng);
		const quote = pickRandom(character.quotes, rng);
		const avatarName = encodeURIComponent(`${character.firstName} ${character.lastName}`);
		const avatar = `https://ui-avatars.com/api/?name=${avatarName}&background=random`;

		const person: Person = {
			id: crypto.randomUUID(),
			characterId: character.id,
			firstName: character.firstName,
			lastName: character.lastName,
			username,
			email,
			password,
			phone,
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
			avatar
		};

		return person;
	}
}
