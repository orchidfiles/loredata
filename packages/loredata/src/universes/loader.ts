import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import type { UniverseData, CharacterData, AddressData, DomainsData } from '@/types';

const dataDir = join(import.meta.dirname, '../data');

export class UniverseLoader {
	private static cache = new Map<string, UniverseData>();

	static register(data: UniverseData): void {
		this.cache.set(data.id, data);
	}

	static load(universeId: string): UniverseData {
		const cached = this.cache.get(universeId);

		if (cached) {
			return cached;
		}

		const universeDir = join(dataDir, universeId);
		const meta = JSON.parse(readFileSync(join(universeDir, 'meta.json'), 'utf-8')) as {
			id: string;
			name: string;
		};

		const characters = JSON.parse(readFileSync(join(universeDir, 'characters.json'), 'utf-8')) as CharacterData[];

		const addresses = JSON.parse(readFileSync(join(universeDir, 'addresses.json'), 'utf-8')) as AddressData[];

		const domains = JSON.parse(readFileSync(join(universeDir, 'domains.json'), 'utf-8')) as DomainsData;

		const universeData: UniverseData = {
			id: meta.id,
			name: meta.name,
			characters,
			addresses,
			domains
		};

		this.cache.set(universeId, universeData);

		return universeData;
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
