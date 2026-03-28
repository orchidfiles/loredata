<script lang="ts">
import { PersonFormatter } from '$shared/formatters';
import { slugify } from '$shared/utils';

import JsonModal from './JsonModal.svelte';

import type { Person } from 'loredata/browser';

interface Props {
	persona: Person;
	onreroll?: () => void;
	onshowjson?: () => void;
}

let { persona, onreroll, onshowjson }: Props = $props();

interface AddressPart {
	text: string;
	href?: string;
}

const addressParts = $derived.by((): AddressPart[] => {
	const a = persona.address;
	const parts: AddressPart[] = [];

	if (a.street) parts.push({ text: a.street });
	if (a.city) parts.push({ text: a.city, href: `/locations/${slugify(a.city)}` });
	if (a.country) parts.push({ text: a.country, href: `/locations/${slugify(a.country)}` });

	return parts;
});

let showJson = $state(false);

function openJson(): void {
	showJson = true;
}

function closeJson(): void {
	showJson = false;
}
</script>

<div class="group card preset-tonal-surface border border-surface-700/30 p-6 flex flex-col gap-6 h-full">
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-2 min-w-0">
			<div class="flex items-center gap-3">
				{#if persona.symbol}
					<div
						class="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-4xl leading-none"
						style={persona.color
							? `background-color: ${persona.color}26`
							: 'background-color: color-mix(in srgb, currentColor 8%, transparent)'}>
						{persona.symbol}
					</div>
				{/if}
				<a
					href="/universes/{persona.universe}/{persona.characterId}"
					class="h3 text-surface-950-50 hover:text-primary-400 transition-colors min-w-0 leading-tight">
					<span class="block">{persona.firstName}</span>
					{#if persona.lastName}<span class="block whitespace-nowrap">{persona.lastName}</span>{/if}
				</a>
			</div>
			{#if persona.quote}
				<p class="text-surface-400 text-sm italic">{persona.quote}</p>
			{/if}
		</div>
		<div class="shrink-0 flex flex-col items-end gap-1.5">
			<span class="badge preset-tonal-primary">{persona.universeName}</span>
			{#if !onshowjson}
				<div class="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
					{#if onreroll}
						<button
							class="btn btn-sm preset-filled-primary-500"
							onclick={onreroll}>Regenerate</button>
					{/if}
					<button
						class="btn btn-sm preset-filled-primary-500"
						onclick={openJson}>Show JSON</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-3 text-sm flex-1">
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Username</p>
			<p class="text-surface-950-50 font-mono">@{persona.username}</p>
		</div>
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Email</p>
			<p class="text-surface-950-50 font-mono">{persona.email}</p>
		</div>
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Profession</p>
			<p class="text-surface-950-50">{persona.profession}</p>
		</div>
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Address</p>
			<p class="text-surface-950-50">
				{#each addressParts as part, i (part.text)}
					{#if i > 0},
					{/if}
					{#if part.href}<a
							href={part.href}
							class="hover:text-primary-400 transition-colors">{part.text}</a
						>{:else}{part.text}{/if}
				{/each}
			</p>
		</div>
		<div class="space-y-2 mt-auto">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Interests</p>
			<div class="flex flex-wrap gap-2">
				{#each persona.interests as interest (interest)}
					<a
						href="/interests/{slugify(interest)}"
						class="badge preset-tonal-primary text-xs px-3 py-1 rounded-full hover:preset-filled-primary-500 transition-colors">
						{interest}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

{#if showJson}
	<JsonModal
		json={PersonFormatter.toJson(persona)}
		onclose={closeJson} />
{/if}
