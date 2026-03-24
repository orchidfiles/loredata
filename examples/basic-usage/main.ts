import { person, group, universes } from 'loredata';

// List available universes
const available = universes();
console.log('Available universes:');

for (const u of available) {
  console.log(`  ${u.id} — ${u.name}`);
}

console.log('');

// Generate a single persona
const p = person({ universe: 'breaking-bad' });
console.log('Single persona:');
console.log(`  ${p.firstName} ${p.lastName} <${p.email}>`);
console.log(`  Profession: ${p.profession}`);
console.log(`  Quote: "${p.quote}"`);
console.log('');

// Generate a group of 3 personas
const g = group({ universe: 'game-of-thrones', size: 3 });
console.log('Group of 3 from Game of Thrones:');

for (const member of g) {
  console.log(`  ${member.firstName} ${member.lastName} — ${member.profession}`);
}
