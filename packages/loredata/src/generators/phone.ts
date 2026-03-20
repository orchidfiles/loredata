import { pickRandom } from './random';

import type { DomainsData } from '@/types';

export class PhoneGenerator {
	static generate(domains: DomainsData, rng: () => number): string {
		if (domains.phoneEasterEggs && domains.phoneEasterEggs.length > 0 && rng() < 0.2) {
			return pickRandom(domains.phoneEasterEggs, rng);
		}

		const prefix = pickRandom(domains.phonePrefixes, rng);
		const suffix = this.randomDigits(7, rng);

		return `${prefix}-${suffix.slice(0, 3)}-${suffix.slice(3)}`;
	}

	private static randomDigits(count: number, rng: () => number): string {
		let result = '';

		for (let i = 0; i < count; i++) {
			result += Math.floor(rng() * 10).toString();
		}

		return result;
	}
}
