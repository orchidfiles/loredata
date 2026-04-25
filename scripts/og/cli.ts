import { join } from 'path';

import { Command } from 'commander';

import { Generator, type GenerateOptions, type SingleCharacterOptions, type SingleUniverseOptions } from './generator';

const OUT_DIR = join(import.meta.dirname, '..', '..', 'apps', 'web', 'static', 'og');

async function main(): Promise<void> {
	const program = new Command()
		.name('generate-og')
		.description('Write Open Graph PNGs to apps/web/static/og.')
		.option('--only <ids>', 'comma-separated universe ids (default: all)')
		.option('--max-chars <n>', 'max character images per universe (default: all)')
		.option('--universe-only <id>', 'render only that universe PNG')
		.option('--universe <id>', 'with --character: render only that character PNG')
		.option('--character <id>', 'with --universe: character slug (e.g. bobby-singer)');

	program.parse(process.argv);

	const opts = program.opts<{
		only?: string;
		maxChars?: string;
		universeOnly?: string;
		universe?: string;
		character?: string;
	}>();

	const universeOnlyOpt = opts.universeOnly?.trim() ?? '';
	const universeOpt = opts.universe?.trim() ?? '';
	const characterOpt = opts.character?.trim() ?? '';

	if (universeOnlyOpt.length > 0) {
		if (universeOpt.length > 0 || characterOpt.length > 0) {
			console.error('Do not combine --universe-only with --universe/--character.');
			process.exit(1);
		}

		console.log('Generating single universe OG image...');

		const singleUniverseOptions: SingleUniverseOptions = {
			outDir: OUT_DIR,
			universeId: universeOnlyOpt
		};

		await Generator.generateSingleUniverse(singleUniverseOptions);

		return;
	}

	if (universeOpt.length > 0 && characterOpt.length === 0) {
		console.error('Missing --character (required with --universe).');
		process.exit(1);
	}

	if (characterOpt.length > 0 && universeOpt.length === 0) {
		console.error('Missing --universe (required with --character).');
		process.exit(1);
	}

	if (universeOpt.length > 0 && characterOpt.length > 0) {
		console.log('Generating single character OG image...');

		const singleOptions: SingleCharacterOptions = {
			outDir: OUT_DIR,
			universeId: universeOpt,
			characterId: characterOpt
		};

		await Generator.generateSingleCharacter(singleOptions);

		return;
	}

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
