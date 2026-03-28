<p align="center">
  <img src="https://raw.githubusercontent.com/orchidfiles/loredata/main/apps/web/static/logo.png" alt="LoreData" width="80" />
</p>

<p align="center">
  <h3>LoreData</h3>
  Generate fake personas using real characters from pop culture universes.<br/>
  Every field — name, email, address, profession, quote — comes from the same fictional world.
</p>

<p align="center">
  <a href="https://loredata.orchidfiles.com">loredata.orchidfiles.com</a> ·
  <a href="https://www.npmjs.com/package/loredata">npm</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/loredata"><img src="https://img.shields.io/npm/v/loredata" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/loredata"><img src="https://img.shields.io/npm/dm/loredata" alt="npm downloads per month" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/loredata" alt="node version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/loredata" alt="license" /></a>
  <a href="https://github.com/orchidfiles/loredata"><img src="https://img.shields.io/github/last-commit/orchidfiles/loredata" alt="last commit" /></a>
</p>

<img src="https://raw.githubusercontent.com/orchidfiles/loredata/main/apps/web/static/screen.png" alt="LoreData screenshot" />

```ts
import { person, group } from 'loredata';

const p = person({ universe: 'breaking-bad' });
// {
//   firstName: 'Walter',
//   lastName: 'White',
//   username: 'heisenberg',
//   email: 'blue_sky_cook@lospollos.com',
//   quote: "I am the one who knocks.",
//   profession: 'chemistry teacher',
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

Works in Node.js, browser, and as a CLI tool.

## Install

```sh
npm install -g loredata
```

## Universes

Available out of the box: `breaking-bad`, `friends`, `game-of-thrones`, `harry-potter`, `house-md`, `lost`, `fast-and-furious`, `matrix`, `peaky-blinders`, `sherlock`, `the-office`

```ts
import { universes } from 'loredata';

universes();
// [
//   { id: 'sherlock', name: 'Sherlock', genre: ['crime', 'drama', 'mystery'], description: '...' },
//   { id: 'game-of-thrones', name: 'Game of Thrones', genre: ['fantasy', 'drama', 'action'], description: '...' },
//   ...
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

Pass a `seed` for reproducible results:

```ts
const p = person({ universe: 'matrix', seed: 42 });
```

## Browser

```ts
import { loadUniverse, personFromData } from 'loredata/browser';

const universe = await loadUniverse('breaking-bad');
const p = personFromData(universe);
```

No `fs` or `path` — safe for Vite, webpack, and any browser bundler.

## CLI

```sh
loredata person --universe breaking-bad
loredata person --universe breaking-bad --format json
loredata person --interests chemistry,cooking
loredata person --name walter
loredata group --universe friends --size 5
loredata universes
```

## Features

- [x] 11 universes with characters, addresses, domains
- [x] Single persona and group generation
- [x] Filter characters by interest, name, universe
- [x] Deterministic output via seed
- [x] Browser-safe entry point
- [x] CLI tool
- [x] Character symbol and color fields

## Development

```sh
git clone https://github.com/orchidfiles/loredata.git
cd loredata
pnpm install
```

Build dev-kit (needed once, before other builds):

```sh
pnpm --filter @loredata/dev-kit build
```

Build the library:

```sh
pnpm --filter loredata build
```

Run the demo app:

```sh
pnpm run demo:dev
```

## Why

Faker.js generates random names and emails. They are internally consistent but meaningless. No shared context, no character identity.

`LoreData` generates personas from real fictional characters. Each persona is recognizable and internally consistent, which makes it useful for demos, screenshots, and seed files where the content matters.

## License

MIT

---

Made by the author of [orchidfiles.com](https://orchidfiles.com) — essays from inside startups.  
If you found `loredata` useful, you'll probably enjoy the essays.
