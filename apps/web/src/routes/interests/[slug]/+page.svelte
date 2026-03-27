<script lang="ts">
import Breadcrumb from '$components/ui/Breadcrumb.svelte';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { interest, characters } = data;
</script>

<svelte:head>
	<title>Characters interested in {interest} — LoreData</title>
	<meta
		name="description"
		content="Pop culture characters interested in {interest}: {characters
			.map((c) => `${c.firstName} ${c.lastName}`)
			.slice(0, 5)
			.join(', ')} and more." />
	<meta
		property="og:title"
		content="Characters interested in {interest}" />
	<meta
		property="og:type"
		content="website" />
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
