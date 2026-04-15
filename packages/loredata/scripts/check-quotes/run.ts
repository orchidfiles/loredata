import { QuoteChecker } from './quote-checker';
import { QuoteReport } from './quote-report';
import { SOURCE_MAP } from './sources';

class QuoteCheckCli {
	static async run(): Promise<void> {
		const universeId = process.argv[2];

		if (!universeId) {
			console.error('Usage: pnpm check:quotes <universe-id>');
			process.exit(1);
		}

		const sourceConfig = SOURCE_MAP[universeId];

		if (!sourceConfig) {
			console.error(`No source configuration for universe: ${universeId}`);
			console.error('Add sources in scripts/check-quotes/sources.ts SOURCE_MAP.');
			process.exit(1);
		}

		const characters = QuoteChecker.loadCharacters(universeId);
		const loadedSources = await QuoteChecker.loadSourceEntries(sourceConfig);
		const entries = loadedSources.entries;
		const normalizedCorpus = loadedSources.normalizedCorpus;

		if (entries.length === 0) {
			console.error('No quote entries parsed from sources.');
			process.exit(1);
		}

		const results = QuoteChecker.check(characters, entries, normalizedCorpus, sourceConfig);
		QuoteReport.print(results);

		const hasBlockingIssues = results.some((result) => {
			if (result.status === 'speaker_mismatch') {
				return true;
			}

			if (result.status === 'missing') {
				return true;
			}

			return false;
		});

		if (hasBlockingIssues) {
			process.exit(2);
		}
	}
}

void QuoteCheckCli.run();
