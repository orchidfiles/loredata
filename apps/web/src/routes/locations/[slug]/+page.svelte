<script lang="ts">
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { location, universes } = data;
</script>

<svelte:head>
	<title>{location} — fictional location — loredata</title>
	<meta
		name="description"
		content="Pop culture universes set in {location}: {universes.map((u) => u.universe.name).join(', ')}." />
	<meta
		property="og:title"
		content="{location} — fictional location" />
	<meta
		property="og:type"
		content="website" />
</svelte:head>

<div class="space-y-8">
	<div class="space-y-2">
		<p class="text-surface-500 text-sm">
			<a
				href="/"
				class="hover:text-surface-300 transition-colors">loredata</a>
			<span class="mx-1">›</span>
			{location}
		</p>
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
