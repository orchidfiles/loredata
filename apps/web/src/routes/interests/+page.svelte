<script lang="ts">
import Breadcrumb from '$components/ui/Breadcrumb.svelte';
import { slugify } from '$shared/utils';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { interests } = data;
</script>

<svelte:head>
	<title>All interests — LoreData</title>
	<meta
		name="description"
		content="Browse all interests across pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more." />
	<meta
		property="og:title"
		content="All interests — LoreData" />
	<meta
		property="og:type"
		content="website" />
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
