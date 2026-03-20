import { pickRandom } from './random';

import type { DomainsData } from '@/types';

export class PasswordGenerator {
	static generate(domains: DomainsData, rng: () => number): string {
		if (domains.passwordEasterEggs && domains.passwordEasterEggs.length > 0 && rng() < 0.3) {
			return pickRandom(domains.passwordEasterEggs, rng);
		}

		return this.randomPassword(12, rng);
	}

	private static randomPassword(length: number, rng: () => number): string {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
		let result = '';

		for (let i = 0; i < length; i++) {
			result += chars[Math.floor(rng() * chars.length)];
		}

		return result;
	}
}
