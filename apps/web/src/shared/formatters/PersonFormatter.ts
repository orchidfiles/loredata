import type { Person, Address } from 'loredata/browser';

export class PersonFormatter {
	static fullName(p: Person): string {
		return `${p.firstName} ${p.lastName}`;
	}

	static formatAddress(a: Address): string {
		const parts: string[] = [a.street, a.city].filter(Boolean) as string[];

		if (a.state) {
			parts.push(a.state);
		}

		if (a.zip) {
			parts.push(a.zip);
		}

		if (a.country) {
			parts.push(a.country);
		}

		return parts.join(', ');
	}

	static toJson(p: Person): string {
		return JSON.stringify(p, null, 2);
	}
}
