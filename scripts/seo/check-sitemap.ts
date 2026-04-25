import { UniverseLoader } from 'loredata';

import { slugify } from '../../apps/web/src/shared/utils/slugify';

const minimumUniverseCount = 5;
const minimumCharacterCount = 5;

interface LocationStats {
	universeIds: Set<string>;
}

interface InterestStats {
	characterCount: number;
}

class SitemapCheck {
	static run(): void {
		const interestSlugs = this.collectInterestSlugs();
		const locationSlugs = this.collectLocationSlugs();

		this.assert(!interestSlugs.includes(''), 'Invalid empty interest slug');
		this.assert(!locationSlugs.includes(''), 'Invalid empty location slug');

		const hasRootInterests = interestSlugs.some((slug) => slug === 'interests');
		const hasRootLocations = locationSlugs.some((slug) => slug === 'locations');

		this.assert(!hasRootInterests, 'Root /interests must not be emitted as sitemap slug');
		this.assert(!hasRootLocations, 'Root /locations must not be emitted as sitemap slug');

		this.assertDeterministicOrder(interestSlugs, 'Interest slug routes must be deterministic');
		this.assertDeterministicOrder(locationSlugs, 'Location slug routes must be deterministic');

		console.log('Sitemap invariants check passed.');
	}

	static collectLocationSlugs(): string[] {
		const map = new Map<string, LocationStats>();

		for (const universeId of UniverseLoader.listAvailable()) {
			const universe = UniverseLoader.load(universeId);

			for (const address of universe.addresses) {
				this.appendLocationStats(map, address.city, universe.id);
				this.appendLocationStats(map, address.state, universe.id);
				this.appendLocationStats(map, address.country, universe.id);
			}
		}

		const locationSlugs = [...map.entries()]
			.filter(([, stats]) => stats.universeIds.size >= minimumUniverseCount)
			.map(([slug]) => slug);

		locationSlugs.sort((left, right) => left.localeCompare(right));

		return locationSlugs;
	}

	static collectInterestSlugs(): string[] {
		const map = new Map<string, InterestStats>();

		for (const universeId of UniverseLoader.listAvailable()) {
			const universe = UniverseLoader.load(universeId);

			for (const character of universe.characters) {
				for (const interest of character.interests) {
					const slug = slugify(interest);
					const stats = map.get(slug) ?? { characterCount: 0 };

					stats.characterCount += 1;
					map.set(slug, stats);
				}
			}
		}

		const interestSlugs = [...map.entries()]
			.filter(([, stats]) => stats.characterCount >= minimumCharacterCount)
			.map(([slug]) => slug);

		interestSlugs.sort((left, right) => left.localeCompare(right));

		return interestSlugs;
	}

	static appendLocationStats(map: Map<string, LocationStats>, locationName: string | undefined, universeId: string): void {
		if (!locationName) {
			return;
		}

		const slug = slugify(locationName);
		const stats = map.get(slug) ?? { universeIds: new Set<string>() };

		stats.universeIds.add(universeId);
		map.set(slug, stats);
	}

	static assertDeterministicOrder(slugs: string[], message: string): void {
		const sortedSlugs = [...slugs].sort((left, right) => left.localeCompare(right));
		const actualSlugs = JSON.stringify(slugs);
		const expectedSlugs = JSON.stringify(sortedSlugs);

		this.assert(actualSlugs === expectedSlugs, message);
	}

	static assert(condition: boolean, message: string): void {
		if (!condition) {
			throw new Error(message);
		}
	}
}

SitemapCheck.run();
