<script lang="ts">
import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import { config } from '$shared/config';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const location = $derived(data.location);
const universes = $derived(data.universes);
const canonicalUrl = $derived(`${config.siteOrigin}/locations/${slugify(location)}`);
const ogImageUrl = `${config.siteOrigin}/og/home.png`;
const pageTitle = $derived(`${location} — LoreData`);
const pageDescription = $derived(
	`Browse fictional universes set in ${location} for screenshots, UI mockups, demos, and seed data.`
);

const collectionSchema = $derived({
	'@context': 'https://schema.org',
	'@type': 'CollectionPage',
	name: location,
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
			name: location,
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
		<Breadcrumb crumbs={[{ label: location }]} />
		<h1 class="h1 text-surface-950-50">{location}</h1>
		<p class="text-surface-400 text-sm"
			>{universes.length} {universes.length === 1 ? 'universe' : 'universes'} set in {location}</p>
	</div>

	<div class="grid gap-3">
		{#each universes as entry (entry.universe.id)}
			<a
				href="/universes/{entry.universe.id}"
				class="card preset-tonal-surface border border-surface-700/20 overflow-hidden hover:preset-tonal-primary transition-colors flex h-[140px]">
				{#if entry.universe.posterPath}
					<img
						src="https://image.tmdb.org/t/p/w185{entry.universe.posterPath}"
						alt={entry.universe.name}
						class="w-[94px] shrink-0 object-cover" />
				{/if}
				<div class="p-3 flex flex-col gap-1 flex-1 min-w-0 overflow-hidden">
					<div class="flex items-baseline justify-between gap-2">
						<p class="text-surface-950-50 font-medium truncate">{entry.universe.name}</p>
						{#if entry.universe.year}
							<span class="text-surface-400 text-xs shrink-0">{entry.universe.year}</span>
						{/if}
					</div>
					<p class="text-surface-400 text-sm line-clamp-2">{entry.universe.description}</p>
					<div class="flex items-center gap-3 text-xs mt-auto">
						{#if entry.universe.rating}
							<span class="text-surface-400 w-10">★ {entry.universe.rating}</span>
						{/if}
						<span class="text-surface-500">{entry.characterCount} characters</span>
						{#if entry.universe.mediaType}
							<span class="badge preset-tonal-surface ml-auto">{entry.universe.mediaType}</span>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
