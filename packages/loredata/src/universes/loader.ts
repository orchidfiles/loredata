import { readFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';

import type { UniverseData, UniverseMeta, CharacterData, AddressData, CharacterEntry, LocationEntry } from '@/types';

const require = createRequire(import.meta.url);
const packageRoot = dirname(require.resolve('loredata/package.json'));
const dataDir = join(packageRoot, 'data');

export class UniverseLoader {
	private static cache = new Map<string, UniverseData>();

	static register(data: UniverseData): void {
		this.cache.set(data.id, data);
	}

	static load(universeId: string): UniverseData {
		if (process.env.NODE_ENV !== 'development') {
			const cached = this.cache.get(universeId);

			if (cached) {
				return cached;
			}
		}

		const universeDir = join(dataDir, universeId);
		const meta = JSON.parse(readFileSync(join(universeDir, 'meta.json'), 'utf-8')) as UniverseMeta;

		const characters = JSON.parse(readFileSync(join(universeDir, 'characters.json'), 'utf-8')) as CharacterData[];

		const addresses = JSON.parse(readFileSync(join(universeDir, 'addresses.json'), 'utf-8')) as AddressData[];

		const universeData: UniverseData = {
			id: meta.id,
			name: meta.name,
			genre: meta.genre,
			description: meta.description,
			characters,
			addresses,
			...(meta.tmdbId !== undefined && { tmdbId: meta.tmdbId }),
			...(meta.mediaType !== undefined && { mediaType: meta.mediaType }),
			...(meta.rating !== undefined && { rating: meta.rating }),
			...(meta.year !== undefined && { year: meta.year }),
			...(meta.networks !== undefined && { networks: meta.networks }),
			...(meta.posterPath !== undefined && { posterPath: meta.posterPath }),
			...(meta.backdropPath !== undefined && { backdropPath: meta.backdropPath })
		};

		this.cache.set(universeId, universeData);

		return universeData;
	}

	static getManifest(): UniverseMeta[] {
		const ids = this.listAvailable();

		const result = ids.map((id) => {
			const universeDir = join(dataDir, id);

			return JSON.parse(readFileSync(join(universeDir, 'meta.json'), 'utf-8')) as UniverseMeta;
		});

		return result;
	}

	static getAllInterests(): string[] {
		const ids = this.listAvailable();
		const interestSet = new Set<string>();

		for (const id of ids) {
			const universe = this.load(id);

			for (const character of universe.characters) {
				for (const interest of character.interests) {
					interestSet.add(interest);
				}
			}
		}

		const result = Array.from(interestSet).sort();

		return result;
	}

	static getAllLocations(): LocationEntry[] {
		const ids = this.listAvailable();
		const seen = new Map<string, LocationEntry>();

		for (const id of ids) {
			const universe = this.load(id);

			for (const address of universe.addresses) {
				if (address.city && !seen.has(`city:${address.city}`)) {
					seen.set(`city:${address.city}`, { name: address.city, type: 'city' });
				}

				if (address.state && !seen.has(`state:${address.state}`)) {
					seen.set(`state:${address.state}`, { name: address.state, type: 'state' });
				}

				if (address.country && !seen.has(`country:${address.country}`)) {
					seen.set(`country:${address.country}`, { name: address.country, type: 'country' });
				}
			}
		}

		return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
	}

	static buildCharacterIndex(): CharacterEntry[] {
		const ids = this.listAvailable();
		const entries: CharacterEntry[] = [];

		for (const id of ids) {
			const universe = this.load(id);

			for (const character of universe.characters) {
				entries.push({
					characterId: character.id,
					universeId: universe.id,
					universeName: universe.name,
					firstName: character.firstName ?? '',
					lastName: character.lastName ?? '',
					interests: character.interests,
					profession: character.profession
				});
			}
		}

		return entries;
	}

	static listAvailable(): string[] {
		const entries = readdirSync(dataDir, { withFileTypes: true });

		const ids = entries
			.filter((entry) => {
				if (!entry.isDirectory()) {
					return false;
				}

				try {
					readFileSync(join(dataDir, entry.name, 'meta.json'), 'utf-8');

					return true;
				} catch {
					return false;
				}
			})
			.map((entry) => entry.name);

		return ids;
	}
}
