<script lang="ts">
import { UniverseStore } from 'loredata/browser';

import { goto } from '$app/navigation';
import PersonaCard from '$features/persona/PersonaCard.svelte';
import UniverseSelector from '$features/universes/UniverseSelector.svelte';

import type { PageData } from './$types';
import type { CharacterQuery, Person } from 'loredata/browser';

let { data }: { data: PageData } = $props();

const { universe } = data;
const manifest = data.manifest;
const store = new UniverseStore([universe]);

const allInterests = [...new Set(universe.characters.flatMap((c) => c.interests))].sort();

const allLocations = [...new Set(universe.addresses.filter((a) => a.city).map((a) => a.city!))].sort();

const COUNTS = [1, 4, 8, 16] as const;

let personaCount = $state<number>(4);
let personas = $state<Person[]>([]);

function generate(): void {
	const query: CharacterQuery = {};

	personas = store.generatePersonas(query, personaCount);
}

generate();

function rerollOne(index: number): void {
	const current = personas[index];

	if (!current) {
		return;
	}

	const fresh = store.personByCharacterId(current.characterId);

	personas = personas.map((p, i) => (i === index ? fresh : p));
}

function setCount(count: number): void {
	personaCount = count;
}
</script>

<svelte:head>
	<title>{universe.name} fake personas — loredata</title>
	<meta
		name="description"
		content="Generate fake {universe.name} personas with realistic names, emails, addresses and more. {universe.description}" />
	<meta
		property="og:title"
		content="{universe.name} fake personas — loredata" />
	<meta
		property="og:description"
		content={universe.description} />
	<meta
		property="og:type"
		content="website" />
</svelte:head>

<div class="space-y-8 pt-4">
	<div class="space-y-2">
		<p class="text-surface-500 text-sm">
			<a
				href="/"
				class="hover:text-surface-300 transition-colors">loredata</a>
			<span class="mx-1">›</span>
			{universe.name}
		</p>
		<h1 class="h1 text-surface-950-50">{universe.name}</h1>
		<p class="text-surface-400 text-sm">{universe.description}</p>
		<div class="flex gap-2 flex-wrap">
			{#each universe.genre as g (g)}
				<span class="badge preset-tonal-surface text-xs">{g}</span>
			{/each}
		</div>
	</div>

	<div class="space-y-2">
		<p class="text-surface-400 text-xs uppercase tracking-wide">Other universes</p>
		<UniverseSelector universes={manifest.filter((u) => u.id !== universe.id)} />
	</div>

	<div class="space-y-5">
		{#if allInterests.length > 0}
			<div class="space-y-2">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Interests</p>
				<div class="flex flex-wrap gap-2">
					{#each allInterests as interest (interest)}
						<a
							href="/interests/{interest}"
							class="badge preset-tonal-surface transition-colors hover:preset-tonal-primary">
							{interest}
						</a>
					{/each}
				</div>
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
				onclick={generate}>Generate</button>
		</div>
	</div>

	{#if personas.length > 0}
		<div class="grid gap-4 {personaCount === 1 || personas.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 sm:grid-cols-2'}">
			{#each personas as persona, i (i)}
				<PersonaCard
					persona={persona}
					onreroll={() => rerollOne(i)}
					oninterest={(interest) => void goto(`/interests/${interest}`)} />
			{/each}
		</div>
	{:else}
		<div class="card preset-tonal-surface p-12 text-center border border-surface-700/20">
			<p class="text-surface-400 text-sm">No characters match the selected filters.</p>
		</div>
	{/if}

	{#if allLocations.length > 0}
		<div class="space-y-2">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Locations in this universe</p>
			<div class="flex flex-wrap gap-2">
				{#each allLocations as city (city)}
					<span class="badge preset-tonal-surface text-xs">{city}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
