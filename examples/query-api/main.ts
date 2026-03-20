import { UniverseLoader, UniverseStore } from '@loredata/loredata';

// Load all universes
const ids = UniverseLoader.listAvailable();
const universesData = ids.map((id) => UniverseLoader.load(id));
const store = new UniverseStore(universesData);

// All available interests
const allInterests = store.getInterests();
console.log(`Total unique interests across all universes: ${allInterests.length}`);
console.log(`Sample: ${allInterests.slice(0, 8).join(', ')}`);
console.log('');

// Filter: characters interested in swordsmanship OR archery
const warriors = store.findCharacters({
  interests: ['swordsmanship', 'archery'],
  interestsMode: 'or',
});

console.log(`Characters into swordsmanship or archery: ${warriors.length}`);

for (const entry of warriors) {
  console.log(`  ${entry.firstName} ${entry.lastName} (${entry.universeName})`);
}

console.log('');

// Filter: search by name substring
const starks = store.findCharacters({ name: 'stark' });
console.log(`Characters matching "stark": ${starks.length}`);

for (const entry of starks) {
  console.log(`  ${entry.firstName} ${entry.lastName}`);
}

console.log('');

// Generate 2 personas for characters interested in cooking
const cooks = store.generatePersonas({ interests: ['cooking'] }, 2);
console.log('Personas with cooking interest:');

for (const p of cooks) {
  console.log(`  ${p.firstName} ${p.lastName} — ${p.profession} [${p.universe}]`);
}
