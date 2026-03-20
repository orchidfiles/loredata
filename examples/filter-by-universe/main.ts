import { UniverseLoader, UniverseStore } from '@loredata/loredata';

// Load a specific universe
const universe = UniverseLoader.load('harry-potter');
const store = new UniverseStore([universe]);

// Generate 4 personas from Harry Potter only
const personas = store.generatePersonas({ universes: ['harry-potter'] }, 4);

console.log('Harry Potter personas:');

for (const p of personas) {
  console.log(`  ${p.firstName} ${p.lastName} <${p.email}>`);
  console.log(`  Interests: ${p.interests.join(', ')}`);
  console.log('');
}
