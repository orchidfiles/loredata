<script lang="ts">
import { UniverseStore } from 'loredata/browser';

import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import JsonModal from '$features/persona/JsonModal.svelte';
import PersonaCard from '$features/persona/PersonaCard.svelte';
import { PersonFormatter } from '$shared/formatters';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';
import type { Person } from 'loredata/browser';

let { data }: { data: PageData } = $props();

const { universe, character } = data;
const store = new UniverseStore([universe]);

let personas = $state<Person[]>([data.initialPersona]);
let showJson = $state(false);

function reroll(): void {
	const fresh = store.personByCharacterId(character.id);

	personas = [fresh];
}
</script>

<svelte:head>
	<title>{character.firstName} {character.lastName} — {universe.name} — LoreData</title>
	<meta
		name="description"
		content="Generate fake data for {character.firstName} {character.lastName} from {universe.name}. Realistic email, address and more." />
	<meta
		property="og:title"
		content="{character.firstName} {character.lastName} — {universe.name}" />
	<meta
		property="og:description"
		content="Generate fake data for {character.firstName} {character.lastName} from {universe.name}." />
	<meta
		property="og:type"
		content="website" />
</svelte:head>

<div class="space-y-8">
	<div class="space-y-2">
		<Breadcrumb
			crumbs={[
				{ label: universe.name, href: `/universes/${universe.id}` },
				{ label: `${character.firstName} ${character.lastName}` }
			]} />
		<h1 class="h1 text-surface-950-50">{character.firstName} {character.lastName}</h1>
		<p class="text-surface-400 text-sm">{character.profession}</p>
		<div class="flex gap-2 flex-wrap">
			{#each character.interests as interest (interest)}
				<a
					href="/interests/{slugify(interest)}"
					class="badge preset-tonal-surface text-xs hover:preset-filled-primary-500 transition-colors">
					{interest}
				</a>
			{/each}
		</div>
	</div>

	{#if character.quotes.length > 0}
		<div class="space-y-2">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Quotes</p>
			<div class="space-y-2">
				{#each character.quotes as quote (quote)}
					<blockquote class="card preset-tonal-surface border border-surface-700/20 px-4 py-3">
						<p class="text-surface-950-50 text-sm italic">{quote}</p>
					</blockquote>
				{/each}
			</div>
		</div>
	{/if}

	<div class="space-y-3">
		<div class="max-w-lg flex items-center justify-between">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Generated persona</p>
			{#if personas.length > 0}
				<div class="flex gap-2">
					<button
						class="btn btn-sm preset-filled-primary-500"
						onclick={reroll}>Regenerate</button>
					<button
						class="btn btn-sm preset-filled-primary-500"
						onclick={() => {
							showJson = true;
						}}>Show JSON</button>
				</div>
			{/if}
		</div>

		{#if personas.length > 0}
			<div class="max-w-lg">
				{#each personas as persona (persona.characterId)}
					<PersonaCard
						persona={persona}
						onshowjson={() => {}} />
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if showJson && personas[0]}
	<JsonModal
		json={PersonFormatter.toJson(personas[0])}
		onclose={() => {
			showJson = false;
		}} />
{/if}
