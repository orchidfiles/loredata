import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

import type { CharacterData, AddressData, DomainsData } from '@/types/universe';

const DATA_DIR = join(import.meta.dirname, '../data');
const NAME_INITIAL_PATTERN = /^[a-z]+_[a-z]$/;

interface ValidationError {
	universe: string;
	character?: string;
	field: string;
	message: string;
}

class UniverseValidator {
	private errors: ValidationError[] = [];

	validate(universeId?: string): void {
		const universeIds = universeId ? [universeId] : this.getUniverseIds();

		for (const id of universeIds) {
			this.validateUniverse(id);
		}

		this.printResults();
	}

	private getUniverseIds(): string[] {
		return readdirSync(DATA_DIR, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
	}

	private validateUniverse(id: string): void {
		const dir = join(DATA_DIR, id);

		this.validateRequiredFiles(id, dir);
		this.validateMeta(id, dir);

		const characters = this.loadJson<CharacterData[]>(id, dir, 'characters.json');

		if (characters) {
			this.validateCharacters(id, characters);
		}

		const addresses = this.loadJson<AddressData[]>(id, dir, 'addresses.json');

		if (addresses) {
			this.validateAddresses(id, addresses);
		}

		const domains = this.loadJson<DomainsData>(id, dir, 'domains.json');

		if (domains) {
			this.validateDomains(id, domains);
		}
	}

	private validateRequiredFiles(id: string, dir: string): void {
		const required = ['meta.json', 'characters.json', 'addresses.json', 'domains.json'];

		for (const file of required) {
			if (!existsSync(join(dir, file))) {
				this.error(id, undefined, 'files', `Missing required file: ${file}`);
			}
		}
	}

	private validateMeta(id: string, dir: string): void {
		const meta = this.loadJson<{ id: string; name: string }>(id, dir, 'meta.json');

		if (!meta) {
			return;
		}

		if (meta.id !== id) {
			this.error(id, undefined, 'meta.id', `meta.id "${meta.id}" does not match directory name "${id}"`);
		}

		if (!meta.name || meta.name.trim() === '') {
			this.error(id, undefined, 'meta.name', 'meta.name is empty');
		}
	}

	private validateCharacters(id: string, characters: CharacterData[]): void {
		if (characters.length < 5) {
			this.error(id, undefined, 'characters', `Only ${characters.length} characters (minimum 5)`);
		}

		const allQuotes = new Map<string, string>();
		const characterIds = new Set<string>();

		for (const character of characters) {
			this.validateCharacter(id, character, allQuotes, characterIds);
		}
	}

	private validateCharacter(
		id: string,
		character: CharacterData,
		allQuotes: Map<string, string>,
		characterIds: Set<string>
	): void {
		const name = `${character.firstName} ${character.lastName}`.trim();

		if (!character.id) {
			this.error(id, name, 'id', 'Missing id');

			return;
		}

		if (characterIds.has(character.id)) {
			this.error(id, name, 'id', `Duplicate character id: "${character.id}"`);
		}

		characterIds.add(character.id);

		if (!character.firstName) {
			this.error(id, character.id, 'firstName', 'Missing firstName');
		}

		this.validateUsernames(id, name, character.usernames);
		this.validateQuotes(id, name, character.quotes, allQuotes);

		if (!character.profession) {
			this.error(id, name, 'profession', 'Missing profession');
		}

		if (!character.interests || character.interests.length === 0) {
			this.error(id, name, 'interests', 'Missing interests');
		}
	}

	private validateUsernames(id: string, character: string, usernames: string[]): void {
		if (!usernames || usernames.length < 3) {
			this.error(id, character, 'usernames', `Only ${usernames?.length ?? 0} usernames (minimum 3)`);

			return;
		}

		for (const username of usernames) {
			if (NAME_INITIAL_PATTERN.test(username)) {
				this.error(id, character, 'usernames', `Generic name_initial pattern: "${username}"`);
			}

			if (/\s/.test(username)) {
				this.error(id, character, 'usernames', `Username contains spaces: "${username}"`);
			}
		}

		const unique = new Set(usernames);

		if (unique.size !== usernames.length) {
			this.error(id, character, 'usernames', 'Duplicate usernames');
		}
	}

	private validateQuotes(id: string, character: string, quotes: string[], allQuotes: Map<string, string>): void {
		if (!quotes || quotes.length < 5) {
			this.error(id, character, 'quotes', `Only ${quotes?.length ?? 0} quotes (minimum 5)`);

			return;
		}

		for (const quote of quotes) {
			if (!quote || quote.trim() === '') {
				this.error(id, character, 'quotes', 'Empty quote');

				continue;
			}

			const normalized = quote.toLowerCase().trim();

			if (allQuotes.has(normalized)) {
				this.error(
					id,
					character,
					'quotes',
					`Duplicate quote (also used by ${allQuotes.get(normalized)}): "${quote.slice(0, 60)}..."`
				);
			}

			allQuotes.set(normalized, character);
		}
	}

	private validateAddresses(id: string, addresses: AddressData[]): void {
		if (addresses.length < 3) {
			this.error(id, undefined, 'addresses', `Only ${addresses.length} addresses (minimum 3)`);
		}

		for (const address of addresses) {
			if (address.country === 'unknown') {
				this.error(
					id,
					undefined,
					'addresses',
					`Address has "unknown" country — omit the field instead: ${JSON.stringify(address)}`
				);
			}
		}
	}

	private validateDomains(id: string, domains: DomainsData): void {
		if (!domains.emailDomains || domains.emailDomains.length === 0) {
			this.error(id, undefined, 'domains.emailDomains', 'No email domains defined');
		}

		if (!domains.phonePrefixes || domains.phonePrefixes.length === 0) {
			this.error(id, undefined, 'domains.phonePrefixes', 'No phone prefixes defined');
		}
	}

	private loadJson<T>(id: string, dir: string, file: string): T | null {
		const path = join(dir, file);

		if (!existsSync(path)) {
			return null;
		}

		try {
			return JSON.parse(readFileSync(path, 'utf-8')) as T;
		} catch {
			this.error(id, undefined, file, `Invalid JSON in ${file}`);

			return null;
		}
	}

	private error(universe: string, character: string | undefined, field: string, message: string): void {
		this.errors.push({ universe, character, field, message });
	}

	private printResults(): void {
		if (this.errors.length === 0) {
			console.log('✓ All universes valid');

			return;
		}

		const byUniverse = new Map<string, ValidationError[]>();

		for (const error of this.errors) {
			const list = byUniverse.get(error.universe) ?? [];

			list.push(error);
			byUniverse.set(error.universe, list);
		}

		for (const [universe, errors] of byUniverse) {
			console.log(`\n${universe} (${errors.length} error${errors.length > 1 ? 's' : ''}):`);

			for (const error of errors) {
				const prefix = error.character ? `  [${error.character}] ${error.field}` : `  ${error.field}`;

				console.log(`${prefix}: ${error.message}`);
			}
		}

		console.log(`\n${this.errors.length} total error${this.errors.length > 1 ? 's' : ''}`);
		process.exit(1);
	}
}

const universeArg = process.argv[2];
const validator = new UniverseValidator();

validator.validate(universeArg);
