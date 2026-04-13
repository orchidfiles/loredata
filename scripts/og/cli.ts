import { join } from 'path';

import { Command } from 'commander';

import { Generator, type GenerateOptions } from './generator';

const OUT_DIR = join(import.meta.dirname, '..', '..', 'apps', 'web', 'static', 'og');

async function main(): Promise<void> {
	const program = new Command()
		.name('generate-og')
		.description('Write Open Graph PNGs to apps/web/static/og.')
		.option('--only <ids>', 'comma-separated universe ids (default: all)')
		.option('--max-chars <n>', 'max character images per universe (default: all)');

	program.parse(process.argv);

	const opts = program.opts<{ only?: string; maxChars?: string }>();

	let onlyUniverseIds: string[] | null = null;

	if (opts.only !== undefined && opts.only.length > 0) {
		const ids = opts.only
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		onlyUniverseIds = ids.length > 0 ? ids : null;
	}

	let maxCharsPerUniverse: number | null = null;

	if (opts.maxChars !== undefined && opts.maxChars !== '') {
		const n = Number.parseInt(opts.maxChars, 10);

		if (Number.isFinite(n) && n >= 0) {
			maxCharsPerUniverse = n;
		}
	}

	console.log('Generating OG images...');

	const options: GenerateOptions = {
		outDir: OUT_DIR,
		onlyUniverseIds,
		maxCharsPerUniverse
	};

	await Generator.generate(options);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
