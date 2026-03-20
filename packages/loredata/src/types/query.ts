export interface CharacterEntry {
	characterId: string;
	universeId: string;
	universeName: string;
	firstName: string;
	lastName: string;
	interests: string[];
	profession: string;
}

export interface CharacterQuery {
	universes?: string[];
	interests?: string[];
	interestsMode?: 'and' | 'or';
	name?: string;
}
