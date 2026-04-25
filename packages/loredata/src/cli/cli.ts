#!/usr/bin/env node
import { createRequire } from 'module';

import { Command } from 'commander';

import { universes, UniverseLoader, UniverseStore } from '@/index';

import type { CharacterQuery } from '@/types';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { version: string };
const program = new Command();

program.name('loredata').description('Generate coherent personas from pop culture universes').version(packageJson.version);

program
	.command('person')
	.description('Generate a single persona')
	.option('-u, --universe <id>', 'Universe ID (e.g. breaking-bad). Omit for all universes.')
	.option('-s, --seed <n>', 'Seed for deterministic generation')
	.option('-f, --format <fmt>', 'Output format: pretty | json', 'pretty')
	.option('--interests <list>', 'Comma-separated interests filter (e.g. chemistry,cooking)')
	.option('--interests-mode <mode>', 'Match mode: and | or (default: or)', 'or')
	.option('--name <query>', 'Search by character name')
	.action(
		(options: { universe?: string; seed?: string; format: string; interests?: string; interestsMode: string; name?: string }) => {
			const seed = options.seed ? parseInt(options.seed, 10) : undefined;
			const universeIds = options.universe ? [options.universe] : UniverseLoader.listAvailable();
			const universesData = universeIds.map((id) => UniverseLoader.load(id));
			const storeInstance = new UniverseStore(universesData);

			const query: CharacterQuery = {
				universes: options.universe ? [options.universe] : [],
				interests: options.interests ? options.interests.split(',').map((s) => s.trim()) : [],
				interestsMode: options.interestsMode === 'and' ? 'and' : 'or',
				name: options.name
			};

			const result = storeInstance.generatePersonas(query, 1, seed)[0];

			if (!result) {
				console.error('No characters match the given filters.');
				process.exit(1);
			}

			if (options.format === 'json') {
				console.log(JSON.stringify(result, null, 2));

				return;
			}

			console.log(
				`
Name:       ${result.firstName} ${result.lastName} (@${result.username})
Email:      ${result.email}
Address:    ${[result.address.street, result.address.city, result.address.country].filter(Boolean).join(', ')}
Profession: ${result.profession}
Interests:  ${result.interests.join(', ')}
Quote:      ${result.quote}
Universe:   ${result.universe}
    `.trim()
			);
		}
	);

program
	.command('group')
	.description('Generate multiple personas')
	.option('-u, --universe <id>', 'Universe ID (e.g. got). Omit for all universes.')
	.option('-n, --size <n>', 'Number of personas', '3')
	.option('-s, --seed <n>', 'Seed for deterministic generation')
	.option('-f, --format <fmt>', 'Output format: pretty | json', 'pretty')
	.option('--interests <list>', 'Comma-separated interests filter (e.g. chemistry,cooking)')
	.option('--interests-mode <mode>', 'Match mode: and | or (default: or)', 'or')
	.option('--name <query>', 'Search by character name')
	.action(
		(options: {
			universe?: string;
			size: string;
			seed?: string;
			format: string;
			interests?: string;
			interestsMode: string;
			name?: string;
		}) => {
			const size = parseInt(options.size, 10);
			const seed = options.seed ? parseInt(options.seed, 10) : undefined;
			const universeIds = options.universe ? [options.universe] : UniverseLoader.listAvailable();
			const universesData = universeIds.map((id) => UniverseLoader.load(id));
			const storeInstance = new UniverseStore(universesData);

			const query: CharacterQuery = {
				universes: options.universe ? [options.universe] : [],
				interests: options.interests ? options.interests.split(',').map((s) => s.trim()) : [],
				interestsMode: options.interestsMode === 'and' ? 'and' : 'or',
				name: options.name
			};

			const result = storeInstance.generatePersonas(query, size, seed);

			if (result.length === 0) {
				console.error('No characters match the given filters.');
				process.exit(1);
			}

			if (options.format === 'json') {
				console.log(JSON.stringify(result, null, 2));

				return;
			}

			for (const p of result) {
				console.log(`${p.firstName} ${p.lastName} <${p.email}> — ${p.profession}`);
			}
		}
	);

program
	.command('universes')
	.description('List available universes')
	.option('-f, --format <fmt>', 'Output format: pretty | json', 'pretty')
	.action((options: { format: string }) => {
		const list = universes();

		if (options.format === 'json') {
			console.log(JSON.stringify(list, null, 2));

			return;
		}

		for (const u of list) {
			console.log(`  ${u.id.padEnd(20)} ${u.name}`);
		}
	});

program.parse();
