import type { CheckResult, CheckStatus } from './types';

export class QuoteReport {
	static print(results: CheckResult[]): void {
		const byStatus: Record<CheckStatus, number> = {
			exact: 0,
			accepted_catchphrase: 0,
			substring: 0,
			fuzzy: 0,
			speaker_mismatch: 0,
			missing: 0
		};
		let okCount = 0;
		let needsSpeakerFixCount = 0;
		let needsManualReviewCount = 0;

		for (const result of results) {
			byStatus[result.status] += 1;

			if (
				result.status === 'exact' ||
				result.status === 'accepted_catchphrase' ||
				result.status === 'substring' ||
				result.status === 'fuzzy'
			) {
				okCount += 1;
				continue;
			}

			if (result.status === 'speaker_mismatch') {
				needsSpeakerFixCount += 1;
				continue;
			}

			needsManualReviewCount += 1;
		}

		console.log('Quote audit summary:');
		console.log(`- ok: ${okCount}`);
		console.log(`- needs-speaker-fix: ${needsSpeakerFixCount}`);
		console.log(`- needs-manual-review: ${needsManualReviewCount}`);

		console.log('\nBreakdown:');
		console.log(`- exact: ${byStatus.exact}`);
		console.log(`- accepted_catchphrase: ${byStatus.accepted_catchphrase}`);
		console.log(`- substring: ${byStatus.substring}`);
		console.log(`- fuzzy: ${byStatus.fuzzy}`);
		console.log(`- speaker_mismatch: ${byStatus.speaker_mismatch}`);
		console.log(`- missing: ${byStatus.missing}`);

		const flagged = results.filter((result) => result.status === 'speaker_mismatch' || result.status === 'missing');

		if (flagged.length === 0) {
			console.log('\nNo flagged quotes.');

			return;
		}

		console.log('\nFlagged quotes:');
		for (const item of flagged) {
			console.log(`\n[${item.status}] ${item.characterId}`);
			console.log(`quote: ${item.quote}`);

			if (item.matchedSpeaker) {
				console.log(`matched speaker: ${item.matchedSpeaker}`);
			}

			if (item.matchedQuote) {
				console.log(`matched quote: ${item.matchedQuote}`);
			}

			if (item.source) {
				console.log(`source: ${item.source}`);
			}
		}
	}
}
