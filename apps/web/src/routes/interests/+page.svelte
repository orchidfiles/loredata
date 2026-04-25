<script lang="ts">
import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import { config } from '$shared/config';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const interests = $derived(data.interests);
const canonicalUrl = `${config.siteOrigin}/interests`;
const ogImageUrl = `${config.siteOrigin}/og/home.png`;
const pageTitle = 'All interests — LoreData';
const pageDescription =
	'Browse all interests across pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more.';

const collectionSchema = {
	'@context': 'https://schema.org',
	'@type': 'CollectionPage',
	name: 'All interests',
	url: canonicalUrl,
	description: pageDescription
};
const collectionSchemaJson = JSON.stringify(collectionSchema);
const collectionSchemaScript = `<script type="application/ld+json">${collectionSchemaJson}<\/script>`;

const breadcrumbSchema = {
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
			item: canonicalUrl
		}
	]
};
const breadcrumbSchemaJson = JSON.stringify(breadcrumbSchema);
const breadcrumbSchemaScript = `<script type="application/ld+json">${breadcrumbSchemaJson}<\/script>`;
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
		<Breadcrumb crumbs={[{ label: 'Interests' }]} />
		<h1 class="h1 text-surface-950-50">All interests</h1>
		<p class="text-surface-400 text-sm">{interests.length} interests across all universes</p>
	</div>

	<div class="flex flex-wrap gap-2">
		{#each interests as interest (interest)}
			<a
				href="/interests/{slugify(interest)}"
				class="badge preset-tonal-surface hover:preset-filled-primary-500 transition-colors">
				{interest}
			</a>
		{/each}
	</div>
</div>
