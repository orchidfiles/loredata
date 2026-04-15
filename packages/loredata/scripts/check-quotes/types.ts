export interface Character {
	id: string;
	firstName: string;
	lastName: string;
	quotes: string[];
}

export interface SourceConfig {
	rawUrls: string[];
	aliases: Record<string, string[]>;
	knownCatchphrases?: Record<string, string[]>;
}

export interface QuoteEntry {
	speaker: string;
	quote: string;
	source: string;
	normalizedQuote: string;
	normalizedTokens: string[];
}

export type CheckStatus = 'exact' | 'accepted_catchphrase' | 'substring' | 'fuzzy' | 'speaker_mismatch' | 'missing';

export interface CheckResult {
	characterId: string;
	quote: string;
	status: CheckStatus;
	source?: string;
	matchedSpeaker?: string;
	matchedQuote?: string;
}
