<script lang="ts">
interface Universe {
	id: string;
	name: string;
	characterCount: number;
}

interface Props {
	universes: Universe[];
	selected: string[];
	featured?: number;
	ontoggle: (id: string) => void;
}

let { universes, selected, featured = 12, ontoggle }: Props = $props();

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
			ontoggle(u.id);
			searchQuery = '';
		}
	} else if (event.key === 'Escape') {
		searchQuery = '';
	}
}

function selectFromSearch(id: string): void {
	ontoggle(id);
	searchQuery = '';
}
</script>

<div class="space-y-2">
	<div class="flex flex-wrap gap-2 -ml-2">
		{#each featuredUniverses as universe (universe.id)}
			<button
				class="btn btn-sm {selected.includes(universe.id) ? 'preset-filled-primary-500' : 'preset-tonal-surface'} transition-all"
				onclick={() => ontoggle(universe.id)}>
				{universe.name}
			</button>
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
							<button
								class="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between {i ===
								highlightedIndex
									? 'preset-tonal-primary'
									: 'hover:preset-tonal-primary'} {selected.includes(u.id) ? 'opacity-60' : ''}"
								onclick={() => selectFromSearch(u.id)}>
								<span>{u.name}</span>
								{#if selected.includes(u.id)}
									<span class="text-xs opacity-60">selected</span>
								{/if}
							</button>
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

	{#if selected.length > 0}
		<div class="flex flex-wrap gap-2 -ml-2">
			{#each selected as id (id)}
				{@const u = universes.find((x) => x.id === id)}
				{#if u && !featuredUniverses.find((f) => f.id === id)}
					<button
						class="btn btn-sm preset-filled-primary-500 transition-all"
						onclick={() => ontoggle(id)}>
						{u.name}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
