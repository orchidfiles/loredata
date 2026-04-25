<script lang="ts">
import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import { config } from '$shared/config';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const interest = $derived(data.interest);
const characters = $derived(data.characters);
const canonicalUrl = $derived(`${config.siteOrigin}/interests/${slugify(interest)}`);
const ogImageUrl = `${config.siteOrigin}/og/home.png`;
const schemaName = $derived(`Characters interested in ${interest}`);
const pageTitle = $derived(`${schemaName} — LoreData`);
const pageDescription = $derived(
	`Use recognizable character profiles interested in ${interest} for screenshots, UI mockups, demos, and seed data.`
);

const collectionSchema = $derived({
	'@context': 'https://schema.org',
	'@type': 'CollectionPage',
	name: schemaName,
	url: canonicalUrl,
	description: pageDescription
});
const collectionSchemaJson = $derived(JSON.stringify(collectionSchema));
const collectionSchemaScript = $derived(`<script type="application/ld+json">${collectionSchemaJson}<\/script>`);

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
			name: 'Interests',
			item: `${config.siteOrigin}/interests`
		},
		{
			'@type': 'ListItem',
			position: 3,
			name: interest,
			item: canonicalUrl
		}
	]
});
const breadcrumbSchemaJson = $derived(JSON.stringify(breadcrumbSchema));
const breadcrumbSchemaScript = $derived(`<script type="application/ld+json">${breadcrumbSchemaJson}<\/script>`);
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
		content={canonicalUrl} />
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
		content="summary" />
	<meta
		name="twitter:title"
		content={pageTitle} />
	<meta
		name="twitter:description"
		content={pageDescription} />
	<meta
		name="twitter:image"
		content={ogImageUrl} />
	{@html collectionSchemaScript}
	{@html breadcrumbSchemaScript}
</svelte:head>

<div class="space-y-8">
	<div class="space-y-2">
		<Breadcrumb crumbs={[{ label: 'Interests', href: '/interests' }, { label: interest }]} />
		<h1 class="h1 text-surface-950-50">Characters interested in {interest}</h1>
		<p class="text-surface-400 text-sm"
			>{characters.length} characters across {new Set(characters.map((c) => c.universe.id)).size} universes</p>
	</div>

	<div class="grid gap-3">
		{#each characters as character (character.id)}
			<div class="card preset-tonal-surface border border-surface-700/20 px-4 py-3 flex items-center justify-between">
				<a
					href="/universes/{character.universe.id}/{character.id}"
					class="flex-1 group/char transition-colors">
					<p class="text-surface-950-50 font-medium group-hover/char:text-primary-400 transition-colors"
						>{character.firstName} {character.lastName}</p>
					<p class="text-surface-400 text-xs">{character.profession}</p>
				</a>
				<a
					href="/universes/{character.universe.id}"
					class="text-surface-400 text-xs hover:text-surface-200 transition-colors ml-4">
					{character.universe.name}
				</a>
			</div>
		{/each}
	</div>
</div>
