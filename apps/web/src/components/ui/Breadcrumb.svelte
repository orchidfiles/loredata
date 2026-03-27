<script lang="ts">
interface Crumb {
	label: string;
	href?: string;
}

let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<p class="text-surface-500 text-sm flex items-center gap-1">
	<a
		href="/"
		class="hover:text-surface-300 transition-colors">LoreData</a>
	{#each crumbs as crumb}
		<span aria-hidden="true">›</span>
		{#if crumb.href}
			<a
				href={crumb.href}
				class="hover:text-surface-300 transition-colors">{crumb.label}</a>
		{:else}
			<span>{crumb.label}</span>
		{/if}
	{/each}
</p>
