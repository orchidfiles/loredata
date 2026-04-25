<script lang="ts">
import { UniverseStore } from 'loredata/browser';

import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import JsonModal from '$features/persona/JsonModal.svelte';
import PersonaCard from '$features/persona/PersonaCard.svelte';
import { config } from '$shared/config';
import { PersonFormatter } from '$shared/formatters';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';
import type { Person } from 'loredata/browser';

let { data }: { data: PageData } = $props();

const universe = $derived(data.universe);
const character = $derived(data.character);
const store = $derived(new UniverseStore([universe]));

const ogPageUrl = $derived(`${config.siteOrigin}/universes/${universe.id}/${character.id}`);
const ogImageUrl = $derived(`${config.siteOrigin}/og/char-${universe.id}-${character.id}.png`);
const canonicalUrl = $derived(ogPageUrl);
const characterName = $derived([character.firstName, character.lastName].filter(Boolean).join(' '));

const pageTitle = $derived(`Generate ${characterName} profile from ${universe.name} — LoreData`);
const pageDescription = $derived(
	`Use a recognizable ${characterName} profile from ${universe.name} for screenshots, UI mockups, demos, and seed data.`
);

const personSchema = $derived.by(() => {
	const item: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		name: characterName,
		url: canonicalUrl,
		description: pageDescription,
		mainEntity: {
			'@type': 'Person',
			name: characterName,
			jobTitle: character.profession
		}
	};
	const mainEntity = item.mainEntity as Record<string, unknown>;

	if (character.address) {
		const address = PersonFormatter.formatAddress(character.address);
		mainEntity.address = address;
	}

	if (character.quotes.length > 0) {
		mainEntity.quote = character.quotes[0];
	}

	return item;
});
const personSchemaJson = $derived(JSON.stringify(personSchema));
const personSchemaScript = $derived(`<script type="application/ld+json">${personSchemaJson}<\/script>`);

const breadcrumbSchema = $derived({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: `${config.siteOrigin}/`
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: universe.name,
			item: `${config.siteOrigin}/universes/${universe.id}`
		},
		{
			'@type': 'ListItem',
			position: 3,
			name: characterName,
			item: canonicalUrl
		}
	]
});
const breadcrumbSchemaJson = $derived(JSON.stringify(breadcrumbSchema));
const breadcrumbSchemaScript = $derived(`<script type="application/ld+json">${breadcrumbSchemaJson}<\/script>`);

// svelte-ignore state_referenced_locally
let personas = $state<Person[]>([data.initialPersona]);
let showJson = $state(false);

function reroll(): void {
	const fresh = store.personByCharacterId(character.id);

	personas = [fresh];
}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta
		name="description"
		content={pageDescription} />
	<meta
		property="og:title"
		content={pageTitle} />
	<meta
		property="og:description"
		content={pageDescription} />
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
	<link
		rel="canonical"
		href={canonicalUrl} />
	<meta
		name="twitter:card"
		content="summary_large_image" />
	<meta
		name="twitter:title"
		content={pageTitle} />
	<meta
		name="twitter:description"
		content={pageDescription} />
	<meta
		name="twitter:image"
		content={ogImageUrl} />
	{@html personSchemaScript}
	{@html breadcrumbSchemaScript}
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
	</div>

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

	<div class="space-y-4 max-w-lg">
		<div class="space-y-1">
			<h2 class="h3 text-surface-950-50">Source data</h2>
			<p class="text-surface-400 text-sm">
				The persona above is generated from these values. Usernames and email domains are specific to
				{[character.firstName, character.lastName].filter(Boolean).join(' ')}. Addresses come from the {universe.name} universe, or
				from the character's own location if defined. Each run picks a different combination.
			</p>
		</div>

		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Usernames</p>
			<div class="flex flex-col gap-0.5">
				{#each character.usernames as username (username)}
					<span class="font-mono text-surface-950-50 text-sm">@{username}</span>
				{/each}
			</div>
		</div>

		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Email domains</p>
			<div class="flex flex-col gap-0.5">
				{#each character.emailDomains as domain (domain)}
					<span class="font-mono text-surface-950-50 text-sm">{domain}</span>
				{/each}
			</div>
		</div>

		{#if character.birthYear}
			<div class="space-y-1">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Birth year</p>
				<p class="text-surface-950-50 text-sm">{character.birthYear}</p>
			</div>
		{/if}

		{#if character.gender}
			<div class="space-y-1">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Gender</p>
				<p class="text-surface-950-50 text-sm">{character.gender}</p>
			</div>
		{/if}

		{#if character.address}
			<div class="space-y-1">
				<p class="text-surface-400 text-xs uppercase tracking-wide">Address</p>
				<p class="text-surface-950-50 text-sm">
					{[
						character.address.street,
						character.address.city,
						character.address.state,
						character.address.zip,
						character.address.country
					]
						.filter(Boolean)
						.join(', ')}
				</p>
			</div>
		{/if}
	</div>

	{#if character.interests.length > 0}
		<div class="space-y-2">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Interests</p>
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
	{/if}

	{#if character.quotes.length > 0}
		<div class="space-y-2 max-w-2lg">
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
</div>

{#if showJson && personas[0]}
	<JsonModal
		json={PersonFormatter.toJson(personas[0])}
		onclose={() => {
			showJson = false;
		}} />
{/if}
