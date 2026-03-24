<script lang="ts">
import { loadUniverse, UniverseStore } from 'loredata/browser';

import PersonaCard from '$features/persona/PersonaCard.svelte';
import UniverseSelector from '$features/universes/UniverseSelector.svelte';

import type { PageData } from './$types';
import type { CharacterEntry, CharacterQuery, Person } from 'loredata/browser';

let { data }: { data: PageData } = $props();

const manifest = data.manifest;

const COUNTS = [1, 4, 8, 16] as const;

let store = $state<UniverseStore | null>(null);
let loadedUniverseId = $state<string | null>(null);

let searchQuery = $state('');
let selectedInterests = $state<string[]>([]);
let personaCount = $state<number>(4);
let personas = $state<Person[]>([]);
let loading = $state(false);

async function ensureUniverseLoaded(id: string): Promise<void> {
	if (loadedUniverseId === id) {
		return;
	}

	loading = true;

	const universeData = await loadUniverse(id);

	store = new UniverseStore([universeData]);
	loadedUniverseId = id;
	loading = false;
}

async function generateFromUniverse(id: string): Promise<void> {
	await ensureUniverseLoaded(id);

	if (!store) {
		return;
	}

	const query: CharacterQuery = {
		interests: selectedInterests,
		interestsMode: 'and'
	};

	personas = store.generatePersonas(query, personaCount);
}

async function generate(): Promise<void> {
	if (loadedUniverseId) {
		await generateFromUniverse(loadedUniverseId);

		return;
	}

	const firstId = manifest[0]?.id;

	if (!firstId) {
		return;
	}

	await generateFromUniverse(firstId);
}

void generate();

let searchResults = $derived.by(() => {
	if (searchQuery.trim().length === 0) {
		return null;
	}

	if (!store) {
		return null;
	}

	const query: CharacterQuery = {
		interests: selectedInterests,
		interestsMode: 'and',
		name: searchQuery
	};

	const entries = store.findCharacters(query);
	const needle = searchQuery.trim().toLowerCase();

	function relevance(entry: CharacterEntry): number {
		if (entry.firstName.toLowerCase().startsWith(needle)) {
			return 0;
		}

		if (entry.lastName.toLowerCase().startsWith(needle)) {
			return 1;
		}

		return 2;
	}

	const sorted = [...entries].sort((a, b) => {
		const diff = relevance(a) - relevance(b);

		if (diff !== 0) {
			return diff;
		}

		return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
	});

	return sorted;
});

let highlightedIndex = $state(-1);

$effect(() => {
	void searchResults;
	highlightedIndex = -1;
});

function rerollOne(index: number): void {
	if (!store) {
		return;
	}

	const current = personas[index];

	if (!current) {
		return;
	}

	const fresh = store.personByCharacterId(current.characterId);

	personas = personas.map((p, i) => (i === index ? fresh : p));
}

async function randomUniverse(): Promise<void> {
	const randomId = manifest[Math.floor(Math.random() * manifest.length)]?.id;

	if (!randomId) {
		return;
	}

	await generateFromUniverse(randomId);
}

function handleSearchInput(event: Event): void {
	const input = event.target as HTMLInputElement;

	searchQuery = input.value;
}

function handleSearchKeydown(event: KeyboardEvent): void {
	if (!searchResults || searchResults.length === 0) {
		return;
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault();
		highlightedIndex = Math.min(highlightedIndex + 1, searchResults.length - 1);
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		highlightedIndex = Math.max(highlightedIndex - 1, 0);
	} else if (event.key === 'Enter' && highlightedIndex >= 0) {
		event.preventDefault();
		const entry = searchResults[highlightedIndex];

		if (entry) {
			generateFromCharacter(entry);
		}
	} else if (event.key === 'Escape') {
		searchQuery = '';
		highlightedIndex = -1;

		const inputEl = event.target as HTMLInputElement;
		inputEl.value = '';
	}
}

function generateFromCharacter(entry: CharacterEntry): void {
	if (!store) {
		return;
	}

	const persona = store.personByCharacterId(entry.characterId);

	personas = [persona];
	searchQuery = '';

	const inputEl = document.querySelector<HTMLInputElement>('input[type="text"]');

	if (inputEl) {
		inputEl.value = '';
	}
}

function filterByInterest(interest: string): void {
	selectedInterests = [interest];
	void generate();
}

function clearInterests(): void {
	selectedInterests = [];
	void generate();
}

function setCount(count: number): void {
	personaCount = count;
}
</script>

<svelte:head>
	<title>loredata — pop culture fake data generator</title>
	<meta
		name="description"
		content="Generate cohesive fake personas from pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more." />
	<meta
		property="og:title"
		content="loredata — pop culture fake data generator" />
	<meta
		property="og:description"
		content="Generate cohesive fake personas from pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more." />
	<meta
		property="og:type"
		content="website" />
</svelte:head>

<div class="space-y-8 pt-4">
	<div class="space-y-2">
		<h1 class="h1 text-surface-950-50">Fake personas from pop culture</h1>
		<p class="text-surface-400 text-sm">Generate test data from Breaking Bad, Game of Thrones, Harry Potter and more.</p>
	</div>

	<div class="space-y-5">
		<div class="space-y-2">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Search by name</p>
			<input
				class="input placeholder:text-surface-400"
				type="text"
				placeholder="Walter, Daenerys, Hermione…"
				oninput={handleSearchInput}
				onkeydown={handleSearchKeydown} />

			{#if searchResults !== null}
				{#if searchResults.length > 0}
					<div class="card preset-tonal-surface border border-surface-700/20 divide-y divide-surface-700/20">
						{#each searchResults as entry, i (entry.characterId)}
							<button
								class="w-full text-left px-4 py-2.5 transition-colors flex items-baseline gap-3 {i === highlightedIndex
									? 'preset-tonal-primary'
									: 'hover:preset-tonal-primary'}"
								onclick={() => generateFromCharacter(entry)}>
								<span class="text-surface-950-50 font-medium">{entry.firstName} {entry.lastName}</span>
								<span class="text-surface-400 text-xs">{entry.universeName}</span>
								<span class="text-surface-500 text-xs ml-auto">{entry.profession}</span>
							</button>
						{/each}
					</div>
				{:else}
					<p class="text-surface-500 text-sm px-1">No characters found</p>
				{/if}
			{/if}
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Universe</p>
				<button
					class="btn btn-sm preset-tonal-surface"
					onclick={randomUniverse}>↻ Random</button>
			</div>
			<UniverseSelector universes={manifest} />
		</div>

		{#if selectedInterests.length > 0}
			<div class="flex items-center gap-2">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Interest</p>
				<span class="badge preset-filled-primary-500 text-xs">{selectedInterests[0]}</span>
				<button
					class="btn btn-sm preset-tonal-surface"
					onclick={clearInterests}>✕</button>
			</div>
		{/if}

		<div class="flex items-center justify-between">
			<div class="btn-group">
				{#each COUNTS as count (count)}
					<button
						class="btn btn-sm {personaCount === count ? 'preset-filled-primary-500' : 'preset-tonal-surface'}"
						onclick={() => setCount(count)}>
						{count}
					</button>
				{/each}
			</div>
			<button
				class="btn preset-filled-primary-500"
				onclick={generate}
				disabled={loading}>
				{loading ? 'Loading…' : 'Generate'}
			</button>
		</div>
	</div>

	{#if personas.length > 0}
		<div class="grid gap-4 {personaCount === 1 || personas.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 sm:grid-cols-2'}">
			{#each personas as persona, i (i)}
				<PersonaCard
					persona={persona}
					onreroll={() => rerollOne(i)}
					oninterest={filterByInterest} />
			{/each}
		</div>
	{:else if !loading}
		<div class="card preset-tonal-surface p-12 text-center border border-surface-700/20">
			<p class="text-surface-400 text-sm">No characters match the selected filters.</p>
		</div>
	{/if}
</div>
