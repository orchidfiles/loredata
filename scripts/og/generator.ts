import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { fork, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'path';

import { UniverseLoader } from 'loredata';

import { config } from './config';
import { RenderCore, type RenderJob } from './render-core';

const require = createRequire(import.meta.url);
const tsxEsmLoader = require.resolve('tsx/esm');
const workerPath = fileURLToPath(new URL('./worker.ts', import.meta.url));
const manifestFileName = '.manifest.json';
const renderVersion = 3;
const homePath = 'home.png';

export interface GenerateOptions {
	outDir: string;
	onlyUniverseIds: string[] | null;
	maxCharsPerUniverse: number | null;
}

export interface SingleCharacterOptions {
	outDir: string;
	universeId: string;
	characterId: string;
}

export interface SingleUniverseOptions {
	outDir: string;
	universeId: string;
}

export class Generator {
	private static backdropCache = new Map<string, string | null>();

	private static hashObject(payload: unknown): string {
		return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
	}

	private static loadManifest(outDir: string): Record<string, string> {
		const path = join(outDir, manifestFileName);

		if (!existsSync(path)) {
			return {};
		}

		try {
			const raw = readFileSync(path, 'utf8');
			const parsed = JSON.parse(raw) as unknown;

			if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
				const result: Record<string, string> = {};

				for (const [key, value] of Object.entries(parsed)) {
					if (typeof value === 'string') {
						result[key] = value;
					}
				}

				return result;
			}
		} catch {
			// Ignore malformed manifest and rebuild it from scratch.
		}

		return {};
	}

	private static saveManifest(outDir: string, manifest: Record<string, string>): void {
		const path = join(outDir, manifestFileName);
		writeFileSync(path, `${JSON.stringify(manifest, null, '\t')}\n`);
	}

	private static cleanupStaleFiles(outDir: string, knownPaths: Set<string>): number {
		let deletedCount = 0;

		for (const fileName of readdirSync(outDir)) {
			if (fileName === manifestFileName || !fileName.endsWith('.png')) {
				continue;
			}

			if (knownPaths.has(fileName)) {
				continue;
			}

			unlinkSync(join(outDir, fileName));
			deletedCount++;
		}

		return deletedCount;
	}

	static async generateSingleCharacter(options: SingleCharacterOptions): Promise<void> {
		const { outDir, universeId, characterId } = options;

		mkdirSync(outDir, { recursive: true });

		const universe = UniverseLoader.load(universeId);
		const character = universe.characters.find((entry) => entry.id === characterId);

		if (character === undefined) {
			throw new Error(`Character not found: ${universeId}/${characterId}`);
		}

		const backdrop = await this.fetchBackdrop(universe.backdropPath);
		const fonts = await RenderCore.loadFonts();
		const png = await RenderCore.renderToPng({ kind: 'character', universe, character, backdrop }, fonts);

		const relPath = `char-${universeId}-${characterId}.png`;
		const characterHash = this.hashObject({
			kind: 'character',
			renderVersion: renderVersion,
			tmdbBackdropSize: config.tmdbBackdropSize,
			universeId: universe.id,
			universeName: universe.name,
			universeBackdropPath: universe.backdropPath ?? null,
			character
		});

		writeFileSync(join(outDir, relPath), png);

		const manifest = this.loadManifest(outDir);
		manifest[relPath] = characterHash;
		this.saveManifest(outDir, manifest);

		console.log(`Wrote ${join(outDir, relPath)}`);
	}

	static async generateSingleUniverse(options: SingleUniverseOptions): Promise<void> {
		const { outDir, universeId } = options;

		mkdirSync(outDir, { recursive: true });

		const universe = UniverseLoader.load(universeId);
		const backdrop = await this.fetchBackdrop(universe.backdropPath);
		const fonts = await RenderCore.loadFonts();
		const png = await RenderCore.renderToPng({ kind: 'universe', universe, backdrop }, fonts);

		const relPath = `universe-${universeId}.png`;
		const universeHash = this.hashObject({
			kind: 'universe',
			renderVersion: renderVersion,
			tmdbBackdropSize: config.tmdbBackdropSize,
			universe
		});

		writeFileSync(join(outDir, relPath), png);

		const manifest = this.loadManifest(outDir);
		manifest[relPath] = universeHash;
		this.saveManifest(outDir, manifest);

		console.log(`Wrote ${join(outDir, relPath)}`);
	}

	private static async fetchBackdrop(path: string | undefined): Promise<string | null> {
		if (!path) {
			return null;
		}

		const cached = this.backdropCache.get(path);

		if (cached !== undefined) {
			return cached;
		}

		try {
			const url = `https://image.tmdb.org/t/p/${config.tmdbBackdropSize}${path}`;
			const res = await fetch(url);

			if (!res.ok) {
				this.backdropCache.set(path, null);

				return null;
			}

			const buffer = await res.arrayBuffer();
			const base64 = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;

			this.backdropCache.set(path, base64);

			return base64;
		} catch {
			this.backdropCache.set(path, null);

			return null;
		}
	}

	static async generate(options: GenerateOptions): Promise<void> {
		const { outDir, onlyUniverseIds, maxCharsPerUniverse } = options;

		mkdirSync(outDir, { recursive: true });
		const previousManifest = this.loadManifest(outDir);

		let universeIds = UniverseLoader.listAvailable();

		if (onlyUniverseIds !== null && onlyUniverseIds.length > 0) {
			const allowed = new Set(onlyUniverseIds);
			universeIds = universeIds.filter((id) => allowed.has(id));
		}

		const jobs: { relPath: string; hash: string; job: RenderJob }[] = [];
		const nextManifest: Record<string, string> = {};
		const knownPaths = new Set<string>();
		let reusedCount = 0;

		const homeHash = this.hashObject({
			kind: 'home',
			renderVersion: renderVersion
		});
		nextManifest[homePath] = homeHash;
		knownPaths.add(homePath);

		if (previousManifest[homePath] === homeHash && existsSync(join(outDir, homePath))) {
			reusedCount++;
		} else {
			jobs.push({
				relPath: homePath,
				hash: homeHash,
				job: { kind: 'home' }
			});
		}

		for (const id of universeIds) {
			const universe = UniverseLoader.load(id);
			const backdrop = await this.fetchBackdrop(universe.backdropPath);

			const universePath = `universe-${id}.png`;
			const universeHash = this.hashObject({
				kind: 'universe',
				renderVersion: renderVersion,
				tmdbBackdropSize: config.tmdbBackdropSize,
				universe
			});

			nextManifest[universePath] = universeHash;
			knownPaths.add(universePath);

			if (previousManifest[universePath] === universeHash && existsSync(join(outDir, universePath))) {
				reusedCount++;
			} else {
				jobs.push({
					relPath: universePath,
					hash: universeHash,
					job: { kind: 'universe', universe, backdrop }
				});
			}

			let characters = universe.characters;

			if (maxCharsPerUniverse !== null && Number.isFinite(maxCharsPerUniverse)) {
				characters = characters.slice(0, maxCharsPerUniverse);
			}

			for (const character of characters) {
				const characterPath = `char-${id}-${character.id}.png`;
				const characterHash = this.hashObject({
					kind: 'character',
					renderVersion: renderVersion,
					tmdbBackdropSize: config.tmdbBackdropSize,
					universeId: universe.id,
					universeName: universe.name,
					universeBackdropPath: universe.backdropPath ?? null,
					character
				});

				nextManifest[characterPath] = characterHash;
				knownPaths.add(characterPath);

				if (previousManifest[characterPath] === characterHash && existsSync(join(outDir, characterPath))) {
					reusedCount++;
				} else {
					jobs.push({
						relPath: characterPath,
						hash: characterHash,
						job: { kind: 'character', universe, character, backdrop }
					});
				}
			}
		}

		const deletedStaleCount = this.cleanupStaleFiles(outDir, knownPaths);

		if (jobs.length === 0) {
			this.saveManifest(outDir, nextManifest);
			console.log(`Done: 0 rendered, ${reusedCount} reused, ${deletedStaleCount} stale removed (${knownPaths.size} total)`);

			return;
		}

		const workerCount = config.workerCount;
		const pool: ChildProcess[] = [];

		for (let i = 0; i < workerCount; i++) {
			pool.push(
				fork(workerPath, [], {
					execArgv: ['--import', tsxEsmLoader],
					silent: true
				})
			);
		}

		let nextMsgId = 0;
		let shuttingDown = false;
		const pending = new Map<number, { resolve: (b: Buffer) => void; reject: (e: Error) => void }>();

		function rejectAllPending(err: Error): void {
			for (const [, { reject }] of pending) {
				reject(err);
			}

			pending.clear();
		}

		for (const child of pool) {
			child.on('message', (msg: { id: number; ok: boolean; data?: string; err?: string }) => {
				const p = pending.get(msg.id);

				if (p === undefined) {
					return;
				}

				pending.delete(msg.id);

				if (msg.ok === true && msg.data !== undefined) {
					p.resolve(Buffer.from(msg.data, 'base64'));
				} else {
					p.reject(new Error(msg.err ?? 'og worker failed'));
				}
			});

			child.on('error', (err) => {
				rejectAllPending(err instanceof Error ? err : new Error(String(err)));
			});

			child.on('exit', (code, signal) => {
				if (shuttingDown) {
					return;
				}

				if (code !== 0 || signal !== null) {
					rejectAllPending(new Error(`og child exited: code=${String(code)} signal=${signal ?? ''}`));
				}
			});
		}

		function runOnChild(child: ChildProcess, job: RenderJob): Promise<Buffer> {
			const id = nextMsgId++;

			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					pending.delete(id);
					reject(new Error(`og worker timeout after ${config.workerJobTimeoutMs}ms`));
				}, config.workerJobTimeoutMs);

				pending.set(id, { resolve, reject });

				child.send({ id, job }, (sendErr) => {
					if (sendErr !== null && sendErr !== undefined) {
						clearTimeout(timer);
						pending.delete(id);
						reject(sendErr);
					}
				});

				const wrapped = pending.get(id);

				if (wrapped === undefined) {
					clearTimeout(timer);

					return;
				}

				pending.set(id, {
					resolve: (buffer) => {
						clearTimeout(timer);
						resolve(buffer);
					},
					reject: (error) => {
						clearTimeout(timer);
						reject(error);
					}
				});
			});
		}

		const buckets: { relPath: string; hash: string; job: RenderJob }[][] = Array.from({ length: workerCount }, () => []);

		jobs.forEach((j, i) => {
			buckets[i % workerCount].push(j);
		});

		async function drainChild(childIndex: number): Promise<void> {
			const child = pool[childIndex];
			const bucket = buckets[childIndex];

			for (const { relPath, hash, job } of bucket) {
				const buf = await runOnChild(child, job);

				writeFileSync(join(outDir, relPath), buf);
				nextManifest[relPath] = hash;
				console.log(`  ${relPath}`);
			}
		}

		try {
			await Promise.all(pool.map((_, ci) => drainChild(ci)));
		} finally {
			shuttingDown = true;
			rejectAllPending(new Error('og generation interrupted'));

			for (const child of pool) {
				child.kill();
			}
		}

		this.saveManifest(outDir, nextManifest);

		const renderedCount = jobs.length;
		const summary = `Done: ${renderedCount} rendered, ${reusedCount} reused, ${deletedStaleCount} stale removed (${knownPaths.size} total, ${workerCount} workers)`;

		console.log(summary);
	}
}
