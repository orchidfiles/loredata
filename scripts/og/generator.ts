import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { fork, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'path';

import { UniverseLoader } from 'loredata';

import { config } from './config';

import type { RenderJob } from './render-core';

const require = createRequire(import.meta.url);
const tsxEsmLoader = require.resolve('tsx/esm');
const workerPath = fileURLToPath(new URL('./worker.ts', import.meta.url));

export interface GenerateOptions {
	outDir: string;
	onlyUniverseIds: string[] | null;
	maxCharsPerUniverse: number | null;
}

export class Generator {
	private static backdropCache = new Map<string, string | null>();

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

		if (existsSync(outDir)) {
			rmSync(outDir, { recursive: true });
		}

		mkdirSync(outDir, { recursive: true });

		let universeIds = UniverseLoader.listAvailable();

		if (onlyUniverseIds !== null && onlyUniverseIds.length > 0) {
			const allowed = new Set(onlyUniverseIds);
			universeIds = universeIds.filter((id) => allowed.has(id));
		}

		const jobs: { relPath: string; job: RenderJob }[] = [];

		jobs.push({ relPath: 'home.png', job: { kind: 'home' } });

		let totalCharacters = 0;

		for (const id of universeIds) {
			const universe = UniverseLoader.load(id);
			const backdrop = await this.fetchBackdrop(universe.backdropPath);

			jobs.push({ relPath: `universe-${id}.png`, job: { kind: 'universe', universe, backdrop } });

			let characters = universe.characters;

			if (maxCharsPerUniverse !== null && Number.isFinite(maxCharsPerUniverse)) {
				characters = characters.slice(0, maxCharsPerUniverse);
			}

			for (const character of characters) {
				jobs.push({
					relPath: `char-${id}-${character.id}.png`,
					job: { kind: 'character', universe, character, backdrop }
				});
				totalCharacters++;
			}
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

		const buckets: { relPath: string; job: RenderJob }[][] = Array.from({ length: workerCount }, () => []);

		jobs.forEach((j, i) => {
			buckets[i % workerCount].push(j);
		});

		async function drainChild(childIndex: number): Promise<void> {
			const child = pool[childIndex];
			const bucket = buckets[childIndex];

			for (const { relPath, job } of bucket) {
				const buf = await runOnChild(child, job);

				writeFileSync(join(outDir, relPath), buf);
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

		const summary = `Done: 1 home + ${universeIds.length} universes + ${totalCharacters} characters (${workerCount} workers)`;

		console.log(summary);
	}
}
