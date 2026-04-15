import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { QuoteParser } from './quote-parser';

import type { Character, CheckResult, QuoteEntry, SourceConfig } from './types';

interface LoadedSources {
	entries: QuoteEntry[];
	normalizedCorpus: string;
}

export class QuoteChecker {
	static loadCharacters(universeId: string): Character[] {
		const filePath = join(process.cwd(), 'data', universeId, 'characters.json');
		const content = readFileSync(filePath, 'utf-8');
		const characters = JSON.parse(content) as Character[];

		return characters;
	}

	static async loadSourceEntries(config: SourceConfig): Promise<LoadedSources> {
		const entries: QuoteEntry[] = [];
		let rawCorpus = '';

		for (const rawUrl of config.rawUrls) {
			const response = await fetch(rawUrl);

			if (!response.ok) {
				throw new Error(`Failed to fetch ${rawUrl}: ${response.status} ${response.statusText}`);
			}

			const raw = await response.text();
			rawCorpus += `\n${raw}`;
			const parsed = QuoteParser.extractEntries(raw, rawUrl);
			entries.push(...parsed);
		}

		const normalizedCorpus = QuoteParser.normalizeText(rawCorpus);
		const loadedSources: LoadedSources = {
			entries,
			normalizedCorpus
		};

		return loadedSources;
	}

	static check(
		characters: Character[],
		entries: QuoteEntry[],
		normalizedCorpus: string,
		sourceConfig: SourceConfig
	): CheckResult[] {
		const results: CheckResult[] = [];
		const aliasesById = sourceConfig.aliases;
		const catchphrasesById = sourceConfig.knownCatchphrases ?? {};

		for (const character of characters) {
			const aliases = this.resolveAliases(character, aliasesById);

			for (const quote of character.quotes) {
				const normalizedQuote = QuoteParser.normalizeText(quote);
				const normalizedTokens = QuoteParser.tokenize(quote);
				const isKnownCatchphrase = this.isKnownCatchphrase(character.id, normalizedQuote, catchphrasesById);

				if (isKnownCatchphrase) {
					const acceptedResult: CheckResult = {
						characterId: character.id,
						quote,
						status: 'accepted_catchphrase'
					};
					results.push(acceptedResult);
					continue;
				}

				const exactHits = entries.filter((entry) => entry.normalizedQuote === normalizedQuote);

				if (exactHits.length > 0) {
					const exactResult = this.buildExactResult(character.id, quote, exactHits, aliases);
					results.push(exactResult);
					continue;
				}

				const speakerEntries = entries.filter((entry) => this.isSpeakerMatch(entry.speaker, aliases));
				const substringHits = speakerEntries.filter((entry) => entry.normalizedQuote.includes(normalizedQuote));

				if (substringHits.length > 0) {
					const substringResult = this.buildSubstringResult(character.id, quote, substringHits);
					results.push(substringResult);
					continue;
				}

				const fuzzyHits = speakerEntries.filter((entry) => this.isFuzzyMatch(entry, normalizedQuote, normalizedTokens));

				if (fuzzyHits.length > 0) {
					const fuzzyResult = this.buildFuzzyResult(character.id, quote, fuzzyHits, aliases);
					results.push(fuzzyResult);
					continue;
				}

				const crossSpeakerHits = entries.filter((entry) => this.isFuzzyMatch(entry, normalizedQuote, normalizedTokens));
				if (crossSpeakerHits.length > 0) {
					const mismatchResult = this.buildSpeakerMismatchResult(character.id, quote, crossSpeakerHits);
					results.push(mismatchResult);
					continue;
				}

				if (normalizedCorpus.includes(normalizedQuote)) {
					const rawSubstringResult = this.buildRawSubstringResult(character.id, quote);
					results.push(rawSubstringResult);
					continue;
				}

				const missingResult: CheckResult = {
					characterId: character.id,
					quote,
					status: 'missing'
				};
				results.push(missingResult);
			}
		}

		return results;
	}

	private static isKnownCatchphrase(
		characterId: string,
		normalizedQuote: string,
		catchphrasesById: Record<string, string[]>
	): boolean {
		const catchphrases = catchphrasesById[characterId];

		if (!catchphrases || catchphrases.length === 0) {
			return false;
		}

		for (const catchphrase of catchphrases) {
			const normalizedCatchphrase = QuoteParser.normalizeText(catchphrase);
			if (normalizedCatchphrase === normalizedQuote) {
				return true;
			}
		}

		return false;
	}

	private static resolveAliases(character: Character, aliasesById: Record<string, string[]>): string[] {
		const existing = aliasesById[character.id];

		if (existing && existing.length > 0) {
			return existing;
		}

		const resolved: string[] = [character.firstName];
		const fullName = `${character.firstName} ${character.lastName}`.trim();

		if (fullName.length > 0) {
			resolved.push(fullName);
		}

		return resolved;
	}

	private static isSpeakerMatch(speaker: string, aliases: string[]): boolean {
		const normalizedSpeaker = QuoteParser.normalizeText(speaker);

		for (const alias of aliases) {
			const normalizedAlias = QuoteParser.normalizeText(alias);
			if (normalizedSpeaker.includes(normalizedAlias)) {
				return true;
			}
		}

		return false;
	}

	private static isFuzzyMatch(entry: QuoteEntry, normalizedQuote: string, normalizedTokens: string[]): boolean {
		if (!entry.normalizedQuote || !normalizedQuote) {
			return false;
		}

		if (normalizedTokens.length < 4) {
			return false;
		}

		if (entry.normalizedTokens.length < 4) {
			return false;
		}

		if (entry.normalizedQuote.includes(normalizedQuote)) {
			return true;
		}

		if (normalizedQuote.includes(entry.normalizedQuote)) {
			return true;
		}

		const overlapCount = this.computeOverlapCount(entry.normalizedTokens, normalizedTokens);
		const queryLength = normalizedTokens.length;

		if (queryLength === 0) {
			return false;
		}

		if (overlapCount < 4) {
			return false;
		}

		const overlapRatio = overlapCount / queryLength;

		if (overlapRatio >= 0.78) {
			const similarity = this.computeSimilarity(entry.normalizedQuote, normalizedQuote);
			if (similarity >= 0.72) {
				return true;
			}
		}

		return false;
	}

	private static computeOverlapCount(leftTokens: string[], rightTokens: string[]): number {
		const leftSet = new Set(leftTokens);
		const rightSet = new Set(rightTokens);
		let count = 0;

		for (const token of leftSet) {
			if (rightSet.has(token)) {
				count += 1;
			}
		}

		return count;
	}

	private static computeSimilarity(left: string, right: string): number {
		const leftTokens = left.split(' ').filter((token) => token.length > 0);
		const rightTokens = right.split(' ').filter((token) => token.length > 0);

		if (leftTokens.length === 0 || rightTokens.length === 0) {
			return 0;
		}

		const leftSet = new Set(leftTokens);
		const rightSet = new Set(rightTokens);
		let intersection = 0;

		for (const token of leftSet) {
			if (rightSet.has(token)) {
				intersection += 1;
			}
		}

		const union = new Set([...leftSet, ...rightSet]).size;
		if (union === 0) {
			return 0;
		}

		return intersection / union;
	}

	private static buildExactResult(characterId: string, quote: string, hits: QuoteEntry[], aliases: string[]): CheckResult {
		const speakerHit = hits.find((entry) => this.isSpeakerMatch(entry.speaker, aliases));

		if (speakerHit) {
			const result: CheckResult = {
				characterId,
				quote,
				status: 'exact',
				source: speakerHit.source,
				matchedSpeaker: speakerHit.speaker,
				matchedQuote: speakerHit.quote
			};

			return result;
		}

		const fallback = hits[0];
		const mismatchResult: CheckResult = {
			characterId,
			quote,
			status: 'speaker_mismatch',
			source: fallback.source,
			matchedSpeaker: fallback.speaker,
			matchedQuote: fallback.quote
		};

		return mismatchResult;
	}

	private static buildFuzzyResult(characterId: string, quote: string, hits: QuoteEntry[], aliases: string[]): CheckResult {
		const speakerHit = hits.find((entry) => this.isSpeakerMatch(entry.speaker, aliases));

		if (speakerHit) {
			const result: CheckResult = {
				characterId,
				quote,
				status: 'fuzzy',
				source: speakerHit.source,
				matchedSpeaker: speakerHit.speaker,
				matchedQuote: speakerHit.quote
			};

			return result;
		}

		const fallback = hits[0];
		const mismatchResult: CheckResult = {
			characterId,
			quote,
			status: 'speaker_mismatch',
			source: fallback.source,
			matchedSpeaker: fallback.speaker,
			matchedQuote: fallback.quote
		};

		return mismatchResult;
	}

	private static buildSpeakerMismatchResult(characterId: string, quote: string, hits: QuoteEntry[]): CheckResult {
		const fallback = hits[0];
		const mismatchResult: CheckResult = {
			characterId,
			quote,
			status: 'speaker_mismatch',
			source: fallback.source,
			matchedSpeaker: fallback.speaker,
			matchedQuote: fallback.quote
		};

		return mismatchResult;
	}

	private static buildSubstringResult(characterId: string, quote: string, hits: QuoteEntry[]): CheckResult {
		const firstHit = hits[0];
		const substringResult: CheckResult = {
			characterId,
			quote,
			status: 'substring',
			source: firstHit.source,
			matchedSpeaker: firstHit.speaker,
			matchedQuote: firstHit.quote
		};

		return substringResult;
	}

	private static buildRawSubstringResult(characterId: string, quote: string): CheckResult {
		const rawSubstringResult: CheckResult = {
			characterId,
			quote,
			status: 'substring',
			source: 'raw-corpus'
		};

		return rawSubstringResult;
	}
}
