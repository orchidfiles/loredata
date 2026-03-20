/**
 * Seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces values in [0, 1).
 */
export function createRng(seed?: number): () => number {
	if (seed === undefined) {
		return Math.random;
	}

	let s = seed;

	return function rng(): number {
		s += 0x6d2b79f5;
		let z = s;
		z = Math.imul(z ^ (z >>> 15), z | 1);
		z ^= z + Math.imul(z ^ (z >>> 7), z | 61);

		return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
	};
}

export function pickRandom<T>(array: T[], rng: () => number): T {
	const index = Math.floor(rng() * array.length);

	return array[index];
}
