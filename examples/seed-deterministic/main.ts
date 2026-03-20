import { UniverseLoader, UniverseStore } from '@loredata/loredata';

const ids = UniverseLoader.listAvailable();
const universesData = ids.map((id) => UniverseLoader.load(id));
const store = new UniverseStore(universesData);

// Same seed always produces the same sequence
const SEED = 42;

const run1 = store.generatePersonas({}, 3, SEED);
const run2 = store.generatePersonas({}, 3, SEED);

console.log('Run 1:');
for (const p of run1) {
  console.log(`  ${p.firstName} ${p.lastName} <${p.email}>`);
}

console.log('');
console.log('Run 2 (same seed):');
for (const p of run2) {
  console.log(`  ${p.firstName} ${p.lastName} <${p.email}>`);
}

const match = run1.every((p, i) => p.email === run2[i]?.email);
console.log('');
console.log(`Results match: ${match}`);

// personByCharacterId is always deterministic with the same seed
const walter = store.personByCharacterId('walter-white', SEED);
console.log('');
console.log(`Walter (seed=${SEED}): ${walter.username} <${walter.email}>`);
