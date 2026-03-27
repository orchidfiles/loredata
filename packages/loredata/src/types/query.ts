export interface CharacterEntry {
	characterId: string;
	universeId: string;
	universeName: string;
	firstName: string;
	lastName: string;
	interests: string[];
	profession: string;
}

export type LocationType = 'city' | 'state' | 'country';

export interface LocationEntry {
	name: string;
	type: LocationType;
}

export interface CharacterQuery {
	universes?: string[];
	interests?: string[];
	interestsMode?: 'and' | 'or';
	name?: string;
}
