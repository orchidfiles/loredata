<script lang="ts">
import { onMount, tick } from 'svelte';

import { page } from '$app/state';

import type { CharacterIndexEntry } from '$shared/types';
import type { UniverseMeta } from 'loredata/browser';

interface Props {
	universes: UniverseMeta[];
	characterIndex: CharacterIndexEntry[];
	onnavigate?: () => void;
}

type SidebarUniverse = UniverseMeta & { sidebarLabel: string };
type SidebarCharacterResult = CharacterIndexEntry & { sidebarUniverseLabel: string };
interface ScrollIndicatorState {
	visible: boolean;
	thumbHeight: number;
	thumbTop: number;
}

let { universes, characterIndex, onnavigate }: Props = $props();

const leadingArticlePattern = /^the\s+/i;
const SCROLL_INDICATOR_TRACK_INSET = 8;

const selectedId = $derived(page.params.slug as string | undefined);

let searchQuery = $state('');
let desktopNavEl: HTMLElement | null = $state(null);
let mobileNavEl: HTMLElement | null = $state(null);
let desktopScrollIndicator = $state<ScrollIndicatorState>(createHiddenScrollIndicator());
let mobileScrollIndicator = $state<ScrollIndicatorState>(createHiddenScrollIndicator());

const isSearching = $derived(searchQuery.trim().length > 0);

function stripLeadingArticle(name: string): string {
	return name.replace(leadingArticlePattern, '');
}

const universesWithSidebarLabel = $derived.by<SidebarUniverse[]>(() =>
	universes.map((u) => ({
		...u,
		sidebarLabel: stripLeadingArticle(u.name)
	}))
);

const sidebarUniverseLabelById = $derived.by(() => {
	return new Map(universesWithSidebarLabel.map((u) => [u.id, u.sidebarLabel]));
});

function sortUniversesForSidebar(items: SidebarUniverse[]): SidebarUniverse[] {
	return [...items].sort((a, b) => a.sidebarLabel.localeCompare(b.sidebarLabel));
}

function createHiddenScrollIndicator(): ScrollIndicatorState {
	return { visible: false, thumbHeight: 0, thumbTop: 0 };
}

const universeResults = $derived.by(() => {
	if (!isSearching) {
		return sortUniversesForSidebar(universesWithSidebarLabel);
	}

	const needle = searchQuery.toLowerCase();

	return sortUniversesForSidebar(universesWithSidebarLabel.filter((u) => u.name.toLowerCase().includes(needle))).slice(0, 8);
});

const characterResults = $derived.by<SidebarCharacterResult[]>(() => {
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

	return matched.slice(0, 8).map((entry) => ({
		...entry,
		sidebarUniverseLabel: sidebarUniverseLabelById.get(entry.universeId) ?? entry.universeName
	}));
});

function getScrollIndicatorState(el: HTMLElement | null): ScrollIndicatorState {
	if (!el) {
		return createHiddenScrollIndicator();
	}

	const scrollHeight = el.scrollHeight;
	const clientHeight = el.clientHeight;
	const maxScrollTop = scrollHeight - clientHeight;

	if (maxScrollTop <= 1) {
		return createHiddenScrollIndicator();
	}

	const minThumbHeight = 28;
	const trackHeight = Math.max(0, clientHeight - SCROLL_INDICATOR_TRACK_INSET * 2);
	const thumbHeight = Math.min(trackHeight, Math.max(minThumbHeight, (trackHeight * clientHeight) / scrollHeight));
	const travel = Math.max(0, trackHeight - thumbHeight);
	const ratio = maxScrollTop > 0 ? el.scrollTop / maxScrollTop : 0;
	const thumbTop = travel * ratio;

	return { visible: true, thumbHeight, thumbTop };
}

function updateScrollIndicators(): void {
	desktopScrollIndicator = getScrollIndicatorState(desktopNavEl);
	mobileScrollIndicator = getScrollIndicatorState(mobileNavEl);
}

function queueScrollIndicatorUpdate(_universeCount: number, _characterCount: number): void {
	void tick().then(() => {
		updateScrollIndicators();
	});
}

$effect(() => {
	queueScrollIndicatorUpdate(universeResults.length, characterResults.length);
});

onMount(() => {
	const handleResize = () => {
		updateScrollIndicators();
	};

	handleResize();
	window.addEventListener('resize', handleResize);

	return () => {
		window.removeEventListener('resize', handleResize);
	};
});
</script>

{#snippet sidebarContent(navigateHandler: (() => void) | undefined)}
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
				onclick={navigateHandler}
				class="block px-3 py-2 text-sm transition-colors truncate
					{universe.id === selectedId ? 'preset-filled-primary-500 font-medium' : 'text-surface-400 hover:preset-tonal-primary'}">
				{universe.sidebarLabel}
			</a>
		{/each}
	{/if}

	{#if characterResults.length > 0}
		<p class="px-3 pt-3 pb-1 text-surface-900 text-xs uppercase tracking-wide">Characters</p>

		{#each characterResults as entry (entry.characterId)}
			<a
				href="/universes/{entry.universeId}/{entry.characterId}"
				onclick={navigateHandler}
				class="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:preset-tonal-primary">
				<span class="truncate flex-1 text-surface-400">{entry.firstName} {entry.lastName}</span>
				<span class="text-surface-400 text-xs shrink-0">{entry.sidebarUniverseLabel}</span>
			</a>
		{/each}
	{/if}
{/snippet}

{#snippet scrollIndicator(indicator: ScrollIndicatorState)}
	{#if indicator.visible}
		<div class="sidebar-scroll-indicator-track pointer-events-none absolute right-1 top-2 bottom-2 w-1.5">
			<div
				class="sidebar-scroll-indicator-thumb absolute left-0 right-0 rounded-full"
				style="height: {indicator.thumbHeight}px; transform: translateY({indicator.thumbTop}px);"></div>
		</div>
	{/if}
{/snippet}

<aside class="hidden lg:flex w-72 shrink-0 flex-col">
	<div
		class="sticky top-0 h-[80vh] max-h-[80vh] card preset-tonal-surface border border-surface-700/30 overflow-hidden flex flex-col">
		<div class="p-3 border-b border-surface-700/30">
			<input
				class="input input-sm w-full placeholder:text-surface-400"
				type="text"
				placeholder="Search…"
				bind:value={searchQuery} />
		</div>

		<div class="relative flex flex-col flex-1 min-h-0">
			<nav
				bind:this={desktopNavEl}
				onscroll={updateScrollIndicators}
				class="sidebar-scroll flex-1 min-h-0 overflow-y-scroll">
				{@render sidebarContent(undefined)}
			</nav>

			{@render scrollIndicator(desktopScrollIndicator)}
		</div>
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

		<div class="relative flex flex-col flex-1 min-h-0">
			<nav
				bind:this={mobileNavEl}
				onscroll={updateScrollIndicators}
				class="sidebar-scroll overflow-y-scroll flex-1 min-h-0">
				{@render sidebarContent(onnavigate)}
			</nav>

			{@render scrollIndicator(mobileScrollIndicator)}
		</div>
	</div>
{/if}

<style>
.sidebar-scroll {
	-ms-overflow-style: none;
	scrollbar-width: none;
	overscroll-behavior-y: contain;
	padding-bottom: 0.5rem;
}

.sidebar-scroll-indicator-track {
	border-radius: 9999px;
}

.sidebar-scroll-indicator-thumb {
	background: rgba(148, 163, 184, 0.22);
}

.sidebar-scroll::-webkit-scrollbar {
	width: 0;
	height: 0;
	display: none;
}
</style>
