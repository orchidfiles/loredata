<script lang="ts">
import { UniverseStore } from 'loredata/browser';
import { tick, untrack } from 'svelte';

import { browser } from '$app/environment';
import { GenerateBar } from '$features/generator';
import PersonaCard from '$features/persona/PersonaCard.svelte';
import { config } from '$shared/config';
import { preferences } from '$shared/preferences.svelte';

import type { PageData } from './$types';
import type { Person } from 'loredata/browser';

let { data }: { data: PageData } = $props();

const universe = $derived(data.universe);
const store = $derived(new UniverseStore([universe]));

const universeMeta = $derived([universe.year].filter(Boolean).join(''));

const MAX_COUNT = 16;

// svelte-ignore state_referenced_locally
let allPersonas = $state<Person[]>([...data.initialPersonas]);
// svelte-ignore state_referenced_locally
let currentUniverseId = $state(data.universe.id);
let personaGridElement = $state<HTMLDivElement | null>(null);

const personas = $derived(allPersonas.slice(0, preferences.personaCount ?? 4));

const ogPageUrl = $derived(`${config.siteOrigin}/universes/${universe.id}`);
const ogImageUrl = $derived(`${config.siteOrigin}/og/universe-${universe.id}.png`);

$effect(() => {
	const id = universe.id;

	if (id === untrack(() => currentUniverseId)) {
		return;
	}

	currentUniverseId = id;
	allPersonas = data.initialPersonas;
});

function generate(): void {
	allPersonas = store.generatePersonas({}, MAX_COUNT);
}

function rerollOne(index: number): void {
	const current = allPersonas[index];

	if (!current) {
		return;
	}

	const fresh = store.personByCharacterId(current.characterId);

	allPersonas = allPersonas.map((p, i) => (i === index ? fresh : p));
}

function syncQuoteHeights(): void {
	if (!browser || !personaGridElement) {
		return;
	}

	const quoteElements = Array.from(personaGridElement.querySelectorAll<HTMLElement>('[data-persona-quote]'));

	for (const quoteElement of quoteElements) {
		quoteElement.style.minHeight = '';
	}

	const quoteRows: { top: number; elements: HTMLElement[] }[] = [];

	for (const quoteElement of quoteElements) {
		const rowTop = Math.round(quoteElement.getBoundingClientRect().top);

		let existingRow = quoteRows.find((row) => row.top === rowTop);

		if (existingRow) {
			existingRow.elements.push(quoteElement);
			continue;
		}

		existingRow = {
			top: rowTop,
			elements: [quoteElement]
		};

		quoteRows.push(existingRow);
	}

	for (const row of quoteRows) {
		const rowQuoteElements = row.elements;
		const rowHeight = Math.max(...rowQuoteElements.map((element) => element.offsetHeight));

		for (const quoteElement of rowQuoteElements) {
			quoteElement.style.minHeight = `${rowHeight}px`;
		}
	}
}

$effect(() => {
	if (!browser) {
		return;
	}

	const visiblePersonas = personas;

	void tick().then(() => {
		if (visiblePersonas.length === 0) {
			return;
		}

		syncQuoteHeights();
	});
});

$effect(() => {
	if (!browser) {
		return;
	}

	const handleResize = (): void => {
		syncQuoteHeights();
	};

	window.addEventListener('resize', handleResize);

	return () => {
		window.removeEventListener('resize', handleResize);
	};
});
</script>

<svelte:head>
	<title>{universe.name} fake personas — LoreData</title>
	<meta
		name="description"
		content="Generate fake {universe.name} personas with realistic names, emails, addresses and more. {universe.description}" />
	<meta
		property="og:title"
		content="{universe.name} fake personas — LoreData" />
	<meta
		property="og:description"
		content={universe.description} />
	<meta
		property="og:type"
		content="website" />
	<meta
		property="og:url"
		content={ogPageUrl} />
	<meta
		property="og:image"
		content={ogImageUrl} />
	<meta
		property="og:image:width"
		content={String(config.og.width)} />
	<meta
		property="og:image:height"
		content={String(config.og.height)} />
</svelte:head>

<div class="space-y-8">
	<div class="relative rounded-xl overflow-hidden h-64 sm:h-74 bg-surface-800">
		{#if universe.backdropPath}
			<img
				src={`https://image.tmdb.org/t/p/w1280${universe.backdropPath}`}
				alt=""
				aria-hidden="true"
				class="absolute inset-0 w-full h-full object-cover object-top" />
		{/if}
		<div class="absolute inset-0 bg-black/60"></div>

		<div class="absolute inset-0 flex p-6 items-end">
			<div class="flex-1 space-y-2 min-w-0">
				<h1 class="h1 text-white/95">{universe.name}</h1>
				{#if universeMeta}
					<p class="text-white/60 text-sm">{universeMeta}</p>
				{/if}
				<p class="text-white/90 max-w-full sm:max-w-[65%]">{universe.description}</p>
				<div class="flex flex-wrap gap-1.5">
					{#each universe.genre as g (g)}
						<span class="badge text-xs capitalize border border-white/40 text-white/80">{g}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="space-y-5">
		<GenerateBar ongenerate={generate} />
	</div>

	{#if personas.length > 0}
		<div
			bind:this={personaGridElement}
			class="grid gap-4 {(preferences.personaCount ?? 4) === 1 || personas.length === 1
				? 'grid-cols-1 max-w-lg'
				: 'grid-cols-1 sm:grid-cols-2'}">
			{#each personas as persona, i (i)}
				<PersonaCard
					persona={persona}
					onreroll={() => rerollOne(i)}
					showUniverse={false} />
			{/each}
		</div>
	{:else}
		<div class="card preset-tonal-surface p-12 text-center border border-surface-700/20">
			<p class="text-surface-400 text-sm">No characters match the selected filters.</p>
		</div>
	{/if}
</div>
