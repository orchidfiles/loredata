<script lang="ts">
import '../app.css';

import { onMount } from 'svelte';
import IconMenu from 'virtual:icons/lucide/menu';
import IconX from 'virtual:icons/lucide/x';

import AppSidebar from '$layouts/AppSidebar.svelte';
import SocialBar from '$layouts/SocialBar.svelte';

import type { LayoutData } from './$types';
import type { Snippet } from 'svelte';

let { children, data }: { children: Snippet; data: LayoutData } = $props();

let drawerOpen = $state(false);

function openDrawer(): void {
	drawerOpen = true;
}

function closeDrawer(): void {
	drawerOpen = false;
}

onMount(() => {
	if (window.location.hostname !== 'loredata.orchidfiles.com') return;
	const script = document.createElement('script');
	script.defer = true;
	script.src = 'https://analytics.orchidfiles.com/script.js';
	script.dataset.websiteId = '30a8c08e-08c9-4bca-8326-916a88a3d274';
	document.head.appendChild(script);
});
</script>

<!-- Mobile header -->
<header class="lg:hidden flex items-center justify-between px-4 py-3 border-b border-surface-700/30 bg-surface-50-950">
	<a
		href="/"
		class="font-semibold text-surface-950-50 text-sm">LoreData</a>
	<button
		class="btn preset-tonal-surface btn-sm flex items-center gap-2"
		onclick={openDrawer}
		aria-label="Open navigation">
		<IconMenu class="size-4" />
		Universes
	</button>
</header>

<!-- Mobile drawer overlay -->
{#if drawerOpen}
	<button
		class="fixed inset-0 z-40 bg-black/50 lg:hidden w-full cursor-default"
		aria-label="Close navigation"
		onclick={closeDrawer}>
	</button>
	<div
		class="fixed inset-y-0 left-0 z-50 w-72 lg:hidden flex flex-col bg-surface-50-950 shadow-xl"
		style="background: var(--color-surface-800, #252540);">
		<div class="flex items-center justify-between px-3 py-2 border-b border-surface-700/30">
			<span class="text-sm font-medium text-surface-950-50">Universes</span>
			<button
				class="btn-icon preset-tonal-surface"
				onclick={closeDrawer}
				aria-label="Close navigation">
				<IconX class="size-4" />
			</button>
		</div>
		<div class="flex-1 overflow-hidden">
			<AppSidebar
				universes={data.manifest}
				characterIndex={data.characterIndex}
				onnavigate={closeDrawer} />
		</div>
	</div>
{/if}

<div class="container mx-auto max-w-6xl px-4 py-8">
	<div class="flex gap-8 items-start">
		<AppSidebar
			universes={data.manifest}
			characterIndex={data.characterIndex} />
		<main class="min-w-0 flex-1">
			{@render children()}
		</main>
	</div>
</div>
<SocialBar />
