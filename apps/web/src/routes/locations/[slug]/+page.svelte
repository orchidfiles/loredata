<script lang="ts">
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { city, universes } = data;
</script>

<svelte:head>
	<title>{city} — fictional location — loredata</title>
	<meta
		name="description"
		content="Pop culture universes set in {city}: {universes.map((u) => u.universe.name).join(', ')}." />
	<meta
		property="og:title"
		content="{city} — fictional location" />
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
			locations
			<span class="mx-1">›</span>
			{city}
		</p>
		<h1 class="h1 text-surface-950-50">{city}</h1>
		<p class="text-surface-400 text-sm">{universes.length} {universes.length === 1 ? 'universe' : 'universes'} set in {city}</p>
	</div>

	<div class="grid gap-3">
		{#each universes as entry (entry.universe.id)}
			<a
				href="/universes/{entry.universe.id}"
				class="card preset-tonal-surface border border-surface-700/20 px-4 py-3 hover:preset-tonal-primary transition-colors">
				<p class="text-surface-950-50 font-medium">{entry.universe.name}</p>
				<p class="text-surface-400 text-xs">{entry.universe.description}</p>
			</a>
		{/each}
	</div>
</div>
