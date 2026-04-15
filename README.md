<p align="center">
  <img src="https://raw.githubusercontent.com/orchidfiles/loredata/main/apps/web/static/logo.png" alt="LoreData" width="80" />
</p>

<h3 align="center">LoreData</h3>

<p align="center">
  Generate coherent personas from pop culture universes.<br/>
  Each persona comes from one fictional world with no cross-universe mixing.<br/>
  Built for demos, mockups, screenshots, and seed fixtures where recognizable context matters.<br/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/loredata"><img src="https://img.shields.io/npm/v/loredata" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/loredata"><img src="https://img.shields.io/npm/dm/loredata" alt="npm downloads per month" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/loredata" alt="node version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/loredata" alt="license" /></a>
  <a href="https://github.com/orchidfiles/loredata"><img src="https://img.shields.io/github/last-commit/orchidfiles/loredata" alt="last commit" /></a>
</p>

<img src="https://raw.githubusercontent.com/orchidfiles/loredata/main/apps/web/static/screen.png" alt="LoreData screenshot" />

**Demo:** [loredata.orchidfiles.com](https://loredata.orchidfiles.com)

## Why LoreData

- Generic demo users like John Doe, Jane Smith, and `test@example.com` work for smoke tests but feel flat in real product demos
- LoreData generates recognizable personas from a single fictional universe, so fields stay coherent by design
- Deterministic output via seed keeps fixtures stable across runs
- Works in Node.js, browser, and as a CLI tool with no network requests

## Who this is for

- developers filling a local database or Storybook stories with recognizable personas
- designers building mockups who do not want to use John Doe again
- QA engineers creating more expressive test accounts with different profiles
- tutorial and conference talk authors who want screenshots that feel less generic

## Features

- [x] 29 universes
- [x] Single persona and group generation
- [x] Filter characters by interest, name, universe
- [x] Deterministic output via seed
- [x] Browser-safe entry point
- [x] CLI tool
- [x] Character symbol and color fields

## Install

```sh
# library
npm install loredata

# CLI
npm install -g loredata
```

## Usage example

```ts
import { person, group } from 'loredata';

const p = person({ universe: 'breaking-bad' });
// {
//   firstName: 'Walter',
//   lastName: 'White',
//   username: 'heisenberg',
//   email: 'blue_sky_cook@lospollos.com',
//   quote: "I am the one who knocks.",
//   profession: 'Chemistry teacher',
//   interests: ['chemistry', 'cooking', 'family'],
//   address: { street: '308 Negra Arroyo Lane', city: 'Albuquerque', state: 'NM' },
//   symbol: '☢️',
//   color: '#4c1d95',
//   universe: 'breaking-bad',
//   universeName: 'Breaking Bad'
// }

const team = group({ universe: 'game-of-thrones', size: 3 });
// [
//   { firstName: 'Jon', lastName: 'Snow', username: 'lord_commander', ... },
//   { firstName: 'Daenerys', lastName: 'Targaryen', username: 'mother_of_dragons', ... },
//   { firstName: 'Tyrion', lastName: 'Lannister', username: 'halfman', ... },
// ]
```

## Persona fields

Each `Person` includes:

- `firstName`, `lastName`
- `username`, `email`
- `address`, `profession`, `interests`
- `quote`, `symbol`, `color`
- `universe`, `universeName`

## Deterministic output

If you need reproducible results, for example for test fixtures, just pass a `seed`:

```ts
const p = person({ universe: 'matrix', seed: 42 });
const team = group({ universe: 'matrix', size: 3, seed: 42 });
```

Given the same `seed`, you always get the same persona or the same group.

## Browser

The library also supports browser environments through a separate entry point with no dependency on `fs` or `path`:

```ts
import { loadUniverse, personFromData } from 'loredata/browser';

const universe = await loadUniverse('breaking-bad');
const p = personFromData(universe);
```

It works with Vite, webpack, and any browser bundler.

## CLI

```sh
loredata person --universe breaking-bad
loredata person --universe breaking-bad --format json
loredata person --interests chemistry,cooking
loredata person --interests chemistry,cooking --interests-mode and
loredata person --name walter
loredata group --universe friends --size 5
loredata universes
```

## Universes

```ts
import { universes } from 'loredata';

universes();
// [
//   { id: 'sherlock', name: 'Sherlock', genre: ['crime', 'drama', 'mystery'], description: '...' },
//   { id: 'game-of-thrones', name: 'Game of Thrones', genre: ['fantasy', 'drama', 'action'], description: '...' },
//   ...
// ]
```

For API/CLI usage, use universe IDs such as `the-office` and `game-of-thrones`.

29 universes available out of the box:

- Avengers
- Better Call Saul
- Big Bang Theory
- Breaking Bad
- Crown
- Fast and Furious
- Friends
- Game of Thrones
- Guardians of the Galaxy
- Harry Potter
- House MD
- Lost
- Matrix
- Office
- Peaky Blinders
- Prison Break
- Sherlock
- Simpsons
- Sopranos
- South Park
- Spider-Man
- Star Wars
- Stranger Things
- Supernatural
- Walking Dead
- Witcher
- Vikings
- Westworld
- X-Men

## Development

```sh
# clone repo and install dependencies
git clone https://github.com/orchidfiles/loredata.git
cd loredata
pnpm install

# build in watch mode
pnpm --filter @loredata/dev-kit build
pnpm --filter loredata build:watch

# start web app
pnpm --filter @loredata/web dev
```

## Disclaimer

LoreData is an unofficial fan tool and is not affiliated with the rights holders of these universes, studios, or streaming platforms.

## License

MIT

---

Made by the author of [orchidfiles.com](https://orchidfiles.com) — essays from inside startups.  
If you found `loredata` useful, you'll probably enjoy the essays.
