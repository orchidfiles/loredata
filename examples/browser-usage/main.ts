/**
 * Browser consumer example.
 * Import from '@loredata/loredata/browser' — no fs/path APIs involved.
 *
 * In a real browser project (Vite/webpack), loadUniverse uses dynamic imports.
 * This file demonstrates the API shape; run it with tsx only for illustration.
 */
import { loadUniverses, getAvailableIds, UniverseStore } from '@loredata/loredata/browser';

const ids = getAvailableIds();
console.log('Available universe ids:', ids);

// Load only what you need
const universes = await loadUniverses(['breaking-bad', 'harry-potter']);
const store = new UniverseStore(universes);

// Get interests for the loaded universes
const interests = store.getInterests();
console.log(`Interests across loaded universes: ${interests.join(', ')}`);

// Generate a persona
const personas = store.generatePersonas({ universes: ['harry-potter'] }, 2);

for (const p of personas) {
  console.log(`${p.firstName} ${p.lastName} — ${p.email}`);
}
