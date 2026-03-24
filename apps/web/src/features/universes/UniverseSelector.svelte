<script lang="ts">
import { goto } from '$app/navigation';

import type { UniverseMeta } from 'loredata/browser';

interface Props {
	universes: UniverseMeta[];
	featured?: number;
}

let { universes, featured = 12 }: Props = $props();

let searchQuery = $state('');

let featuredUniverses = $derived(universes.slice(0, featured));

let searchResults = $derived.by(() => {
	if (searchQuery.trim().length === 0) {
		return null;
	}

	const needle = searchQuery.toLowerCase();

	return universes.filter((u) => u.name.toLowerCase().includes(needle)).slice(0, 10);
});

let highlightedIndex = $state(-1);

$effect(() => {
	void searchResults;
	highlightedIndex = -1;
});

function handleKeydown(event: KeyboardEvent): void {
	if (!searchResults || searchResults.length === 0) {
		return;
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault();
		highlightedIndex = Math.min(highlightedIndex + 1, searchResults.length - 1);
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		highlightedIndex = Math.max(highlightedIndex - 1, 0);
	} else if (event.key === 'Enter' && highlightedIndex >= 0) {
		event.preventDefault();
		const u = searchResults[highlightedIndex];

		if (u) {
			void goto(`/universes/${u.id}`);
		}
	} else if (event.key === 'Escape') {
		searchQuery = '';
	}
}
</script>

<div class="space-y-2">
	<div class="flex flex-wrap gap-2 -ml-2">
		{#each featuredUniverses as universe (universe.id)}
			<a
				href="/universes/{universe.id}"
				class="btn btn-sm preset-tonal-surface transition-all">
				{universe.name}
			</a>
		{/each}
	</div>

	{#if universes.length > featured}
		<div class="relative">
			<input
				class="input input-sm"
				type="text"
				placeholder="Search universes…"
				bind:value={searchQuery}
				onkeydown={handleKeydown} />

			{#if searchResults !== null}
				{#if searchResults.length > 0}
					<div
						class="absolute z-10 top-full mt-1 w-full card preset-tonal-surface border border-surface-700/20 divide-y divide-surface-700/20">
						{#each searchResults as u, i (u.id)}
							<a
								href="/universes/{u.id}"
								class="block px-4 py-2 text-sm transition-colors {i === highlightedIndex
									? 'preset-tonal-primary'
									: 'hover:preset-tonal-primary'}">
								{u.name}
							</a>
						{/each}
					</div>
				{:else}
					<div class="absolute z-10 top-full mt-1 w-full card preset-tonal-surface border border-surface-700/20 px-4 py-2">
						<p class="text-surface-500 text-sm">No universes found</p>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
