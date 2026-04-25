import { CodeHighlighter } from '$shared/utils/code-highlighter';

import type { PageServerLoad } from './$types';

export const prerender = true;

const exampleCode = `import { person } from 'loredata';

const p = person({ universe: 'breaking-bad' });

console.log(p);

// Output
{
  firstName: 'Walter',
  lastName: 'White',
  username: 'heisenberg',
  email: 'blue_sky_cook@lospollos.com',
  quote: 'I am the one who knocks.',
  profession: 'Chemistry teacher',
  interests: ['chemistry', 'cooking', 'family'],
  address: { street: '308 Negra Arroyo Lane', city: 'Albuquerque', state: 'NM' },
  symbol: '☢️',
  universe: 'breaking-bad',
  universeName: 'Breaking Bad'
}`;

const groupExampleCode = `import { group } from 'loredata';

const team = group({ universe: 'game-of-thrones', size: 3 });

console.log(team);

// Output
[
  { firstName: 'Jon', lastName: 'Snow', username: 'lord_commander' },
  { firstName: 'Daenerys', lastName: 'Targaryen', username: 'mother_of_dragons' },
  { firstName: 'Tyrion', lastName: 'Lannister', username: 'halfman' }
]`;

const cliCode = `loredata person --universe breaking-bad
loredata person --universe breaking-bad --format json
loredata person --interests chemistry,cooking
loredata person --interests chemistry,cooking --interests-mode and
loredata person --name walter
loredata group --universe friends --size 5
loredata universes`;

const universesCode = `import { universes } from 'loredata';

console.log(universes());

// Output
[
  { id: 'sherlock', name: 'Sherlock', genre: ['crime', 'drama', 'mystery'], description: '...' },
  { id: 'game-of-thrones', name: 'Game of Thrones', genre: ['fantasy', 'drama', 'action'], description: '...' },
  ...
]`;

export const load: PageServerLoad = async () => {
	const exampleHtml = await CodeHighlighter.getHtml(exampleCode, 'ts');
	const groupExampleHtml = await CodeHighlighter.getHtml(groupExampleCode, 'ts');
	const cliHtml = await CodeHighlighter.getHtml(cliCode, 'bash');
	const universesHtml = await CodeHighlighter.getHtml(universesCode, 'ts');

	return {
		cliHtml,
		exampleHtml,
		groupExampleHtml,
		universesHtml
	};
};
