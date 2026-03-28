<script lang="ts">
import { page } from '$app/state';

import type { CharacterIndexEntry } from '$shared/types';
import type { UniverseMeta } from 'loredata/browser';

interface Props {
	universes: UniverseMeta[];
	characterIndex: CharacterIndexEntry[];
	onnavigate?: () => void;
}

let { universes, characterIndex, onnavigate }: Props = $props();

const selectedId = $derived(page.params.slug as string | undefined);

let searchQuery = $state('');

const isSearching = $derived(searchQuery.trim().length > 0);

const universeResults = $derived.by(() => {
	if (!isSearching) {
		return universes;
	}

	const needle = searchQuery.toLowerCase();

	return universes.filter((u) => u.name.toLowerCase().includes(needle)).slice(0, 8);
});

const characterResults = $derived.by(() => {
	if (!isSearching) {
		return [];
	}

	const needle = searchQuery.toLowerCase();

	const matched = characterIndex.filter((e) => {
		const full = `${e.firstName} ${e.lastName}`.toLowerCase();

		return full.includes(needle);
	});

	matched.sort((a, b) => {
		const aFirst = a.firstName.toLowerCase().startsWith(needle) ? 0 : 1;
		const bFirst = b.firstName.toLowerCase().startsWith(needle) ? 0 : 1;

		return aFirst - bFirst;
	});

	return matched.slice(0, 8);
});
</script>

<aside class="hidden lg:flex w-72 shrink-0 flex-col">
	<div class="sticky top-0 card preset-tonal-surface border border-surface-700/30 overflow-hidden">
		<div class="p-3 border-b border-surface-700/30">
			<input
				class="input input-sm w-full placeholder:text-surface-400"
				type="text"
				placeholder="Search…"
				bind:value={searchQuery} />
		</div>

		<nav class="overflow-y-auto max-h-[calc(100vh-4rem)]">
			{#if isSearching && universeResults.length === 0 && characterResults.length === 0}
				<p class="px-3 py-4 text-surface-500 text-sm">Nothing found</p>
			{/if}

			{#if universeResults.length > 0}
				{#if isSearching}
					<p class="px-3 pt-3 pb-1 text-surface-900 text-xs uppercase tracking-wide">Universes</p>
				{/if}

				{#each universeResults as universe (universe.id)}
					<a
						href="/universes/{universe.id}"
						class="block px-3 py-2 text-sm transition-colors truncate
							{universe.id === selectedId ? 'preset-filled-primary-500 font-medium' : 'text-surface-400 hover:preset-tonal-primary'}">
						{universe.name}
					</a>
				{/each}
			{/if}

			{#if characterResults.length > 0}
				<p class="px-3 pt-3 pb-1 text-surface-900 text-xs uppercase tracking-wide">Characters</p>

				{#each characterResults as entry (entry.characterId)}
					<a
						href="/universes/{entry.universeId}/{entry.characterId}"
						class="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:preset-tonal-primary">
						<span class="truncate flex-1 text-surface-400">{entry.firstName} {entry.lastName}</span>
						<span class="text-surface-400 text-xs shrink-0">{entry.universeName}</span>
					</a>
				{/each}
			{/if}
		</nav>
	</div>
</aside>

{#if onnavigate !== undefined}
	<!-- Mobile sidebar content (rendered inside drawer) -->
	<div class="flex flex-col h-full">
		<div class="p-3 border-b border-surface-700/30">
			<input
				class="input input-sm w-full placeholder:text-surface-400"
				type="text"
				placeholder="Search…"
				bind:value={searchQuery} />
		</div>

		<nav class="overflow-y-auto flex-1">
			{#if isSearching && universeResults.length === 0 && characterResults.length === 0}
				<p class="px-3 py-4 text-surface-500 text-sm">Nothing found</p>
			{/if}

			{#if universeResults.length > 0}
				{#if isSearching}
					<p class="px-3 pt-3 pb-1 text-surface-900 text-xs uppercase tracking-wide">Universes</p>
				{/if}

				{#each universeResults as universe (universe.id)}
					<a
						href="/universes/{universe.id}"
						onclick={onnavigate}
						class="block px-3 py-2 text-sm transition-colors truncate
							{universe.id === selectedId ? 'preset-filled-primary-500 font-medium' : 'text-surface-400 hover:preset-tonal-primary'}">
						{universe.name}
					</a>
				{/each}
			{/if}

			{#if characterResults.length > 0}
				<p class="px-3 pt-3 pb-1 text-surface-900 text-xs uppercase tracking-wide">Characters</p>

				{#each characterResults as entry (entry.characterId)}
					<a
						href="/universes/{entry.universeId}/{entry.characterId}"
						onclick={onnavigate}
						class="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:preset-tonal-primary">
						<span class="truncate flex-1 text-surface-400">{entry.firstName} {entry.lastName}</span>
						<span class="text-surface-400 text-xs shrink-0">{entry.universeName}</span>
					</a>
				{/each}
			{/if}
		</nav>
	</div>
{/if}
