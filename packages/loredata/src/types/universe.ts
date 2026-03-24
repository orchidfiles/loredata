export interface CharacterData {
	id: string;
	firstName: string;
	lastName: string;
	usernames: string[];
	profession: string;
	interests: string[];
	quotes: string[];
	gender?: 'male' | 'female' | 'other';
	birthYear?: number;
	address?: AddressData;
	emailDomain?: string;
}

export interface AddressData {
	street?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
}

export interface DomainsData {
	emailDomains: string[];
	phonePrefixes: string[];
	phoneEasterEggs?: string[];
	passwordEasterEggs?: string[];
}

export interface UniverseData {
	id: string;
	name: string;
	genre: string[];
	description: string;
	characters: CharacterData[];
	addresses: AddressData[];
	domains: DomainsData;
}

export interface UniverseMeta {
	id: string;
	name: string;
	genre: string[];
	description: string;
}
