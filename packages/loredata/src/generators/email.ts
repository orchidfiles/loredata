import { pickRandom } from './random';

import type { DomainsData } from '@/types';

export class EmailGenerator {
	static generate(firstName: string, lastName: string, domains: DomainsData, rng: () => number): string {
		const domain = pickRandom(domains.emailDomains, rng);
		const first = firstName.toLowerCase();
		const last = lastName.toLowerCase();

		return `${first}.${last}@${domain}`;
	}

	static generateFromUsername(username: string, domains: DomainsData, rng: () => number): string {
		const domain = pickRandom(domains.emailDomains, rng);

		return `${username}@${domain}`;
	}
}
