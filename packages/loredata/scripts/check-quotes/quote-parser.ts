import type { QuoteEntry } from './types';

export class QuoteParser {
	private static readonly quoteRegex = /'''([^']+?)''':\s*(.+)$/;

	static normalizeText(value: string): string {
		let normalized = value.toLowerCase();
		normalized = normalized.replace(/&nbsp;/g, ' ');
		normalized = normalized.replace(/&quot;/g, '"');
		normalized = normalized.replace(/[‘’]/g, "'");
		normalized = normalized.replace(/[“”]/g, '"');
		normalized = normalized.replace(/\u2026/g, '...');
		normalized = normalized.replace(/[.,!?;:()[\]{}"']/g, ' ');
		normalized = normalized.replace(/\s+/g, ' ');
		normalized = normalized.trim();

		return normalized;
	}

	static tokenize(value: string): string[] {
		const normalized = this.normalizeText(value);
		const parts = normalized.split(' ');
		const tokens: string[] = [];

		for (const part of parts) {
			if (part.length < 3) {
				continue;
			}

			tokens.push(part);
		}

		return tokens;
	}

	static stripWikiMarkup(value: string): string {
		let stripped = value;
		stripped = stripped.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1');
		stripped = stripped.replace(/<ref[^>]*>.*?<\/ref>/g, '');
		stripped = stripped.replace(/<[^>]+>/g, '');
		stripped = stripped.replace(/\{\{[^}]+\}\}/g, '');
		stripped = stripped.replace(/''+/g, '');
		stripped = stripped.trim();

		return stripped;
	}

	static extractEntries(raw: string, source: string): QuoteEntry[] {
		const lines = raw.split('\n');
		const entries: QuoteEntry[] = [];

		for (const line of lines) {
			const match = line.match(this.quoteRegex);

			if (!match) {
				continue;
			}

			const speaker = this.stripWikiMarkup(match[1]);
			const quote = this.stripWikiMarkup(match[2]);

			if (!speaker || !quote) {
				continue;
			}

			const normalizedQuote = this.normalizeText(quote);
			const normalizedTokens = this.tokenize(quote);
			const entry: QuoteEntry = {
				speaker,
				quote,
				source,
				normalizedQuote,
				normalizedTokens
			};

			entries.push(entry);
		}

		return entries;
	}
}
