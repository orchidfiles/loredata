/**
 * Normalize profession casing: capitalize the first letter of each profession.
 *
 * Usage:
 *   node --import tsx/esm scripts/normalize-professions.ts
 *   node --import tsx/esm scripts/normalize-professions.ts breaking-bad
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { formatJson } from './format-json.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');

const targetUniverse = process.argv[2];

function normalizeProfession(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

const universes = targetUniverse
	? [targetUniverse]
	: fs.readdirSync(dataDir).filter((d) => fs.statSync(path.join(dataDir, d)).isDirectory());

let totalChanged = 0;

for (const universe of universes) {
	const filePath = path.join(dataDir, universe, 'characters.json');

	if (!fs.existsSync(filePath)) {
		console.warn(`Skipping ${universe}: characters.json not found`);
		continue;
	}

	const characters = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>[];
	let changed = 0;

	for (const char of characters) {
		if (typeof char.profession === 'string') {
			const normalized = normalizeProfession(char.profession);

			if (normalized !== char.profession) {
				char.profession = normalized;
				changed++;
			}
		}
	}

	if (changed > 0) {
		fs.writeFileSync(filePath, formatJson(characters));
		console.log(`${universe}: ${changed} profession(s) normalized`);
		totalChanged += changed;
	}
}

console.log(`\nDone. Total changed: ${totalChanged}`);
