<script lang="ts">
interface Props {
	interests: string[];
	selected: string[];
	ontoggle: (interest: string) => void;
}

let { interests, selected, ontoggle }: Props = $props();
</script>

{#if interests.length > 0}
	<div class="flex flex-wrap gap-2 -ml-2">
		{#each interests as interest (interest)}
			<button
				class="badge {selected.includes(interest)
					? 'preset-filled-primary-500'
					: 'preset-tonal-surface'} cursor-pointer transition-all text-xs px-3 py-1 rounded-full"
				onclick={() => ontoggle(interest)}>
				{interest}
			</button>
		{/each}
	</div>
{/if}
