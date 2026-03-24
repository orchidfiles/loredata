<script lang="ts">
import { PersonFormatter } from '$shared/formatters';

import JsonModal from './JsonModal.svelte';

import type { Person } from 'loredata/browser';

interface Props {
	persona: Person;
	onreroll?: () => void;
	oninterest?: (interest: string) => void;
	onshowjson?: () => void;
}

let { persona, onreroll, oninterest, onshowjson }: Props = $props();

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
		<div>
			<h2 class="h3 text-surface-950-50">{PersonFormatter.fullName(persona)}</h2>
			{#if persona.quote}
				<p class="text-surface-400 text-sm italic mt-1">{persona.quote}</p>
			{/if}
		</div>
		<div class="shrink-0 flex flex-col items-end gap-1.5">
			<span class="badge preset-tonal-primary">{persona.universeName}</span>
			{#if !onshowjson}
				<div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
			<p class="text-surface-400 text-xs uppercase tracking-wide">Phone</p>
			<p class="text-surface-950-50 font-mono">{persona.phone}</p>
		</div>
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Profession</p>
			<p class="text-surface-950-50">{persona.profession}</p>
		</div>
		<div class="space-y-1">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Address</p>
			<p class="text-surface-950-50">{PersonFormatter.formatAddress(persona.address)}</p>
		</div>
		<div class="space-y-2 mt-auto">
			<p class="text-surface-400 text-xs uppercase tracking-wide">Interests</p>
			<div class="flex flex-wrap gap-2">
				{#each persona.interests as interest (interest)}
					{#if oninterest}
						<button
							class="badge preset-tonal-primary text-xs px-3 py-1 rounded-full hover:preset-filled-primary-500 transition-colors cursor-pointer"
							onclick={() => oninterest(interest)}>
							{interest}
						</button>
					{:else}
						<span class="badge preset-tonal-primary text-xs px-3 py-1 rounded-full">
							{interest}
						</span>
					{/if}
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
