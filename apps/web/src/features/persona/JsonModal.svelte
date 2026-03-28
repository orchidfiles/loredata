<script lang="ts">
import { Drawer } from 'vaul-svelte';

import { isMobile } from '$shared/media.svelte';

interface Props {
	json: string;
	onclose: () => void;
}

let { json, onclose }: Props = $props();

let dialog = $state<HTMLDialogElement | null>(null);
let drawerOpen = $state(true);
let copied = $state(false);

$effect(() => {
	if (!isMobile.current && dialog) {
		dialog.showModal();
	}
});

function copyJson(): void {
	void navigator.clipboard.writeText(json).then(() => {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	});
}

function handleDialogClick(event: MouseEvent): void {
	if (event.target === dialog) {
		onclose();
	}
}

function handleKeydown(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		event.preventDefault();
		onclose();
	}
}

function handleDrawerOpenChange(value: boolean): void {
	if (!value) {
		onclose();
	}
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isMobile.current}
	<!-- Mobile: vaul drawer with swipe -->
	<Drawer.Root
		bind:open={drawerOpen}
		onOpenChange={handleDrawerOpenChange}
		direction="bottom">
		<Drawer.Portal>
			<Drawer.Overlay />
			<Drawer.Content
				class="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl
					border border-surface-700/30 border-b-0 bg-surface-100-900">
				<div class="flex justify-center pt-3 pb-1">
					<div class="h-1.5 w-10 rounded-full bg-surface-400/50"></div>
				</div>

				<div class="flex items-center justify-between px-5 py-4 border-b border-surface-700/30 shrink-0">
					<p class="text-sm font-medium text-surface-950-50">JSON</p>
					<button
						class="btn-icon preset-tonal-surface size-10"
						onclick={() => {
							drawerOpen = false;
						}}
						aria-label="Close">
						✕
					</button>
				</div>

				<div class="overflow-auto flex-1 p-5 max-h-[60vh]">
					<pre class="text-xs text-surface-300 font-mono leading-relaxed whitespace-pre">{json}</pre>
				</div>

				<div class="px-5 py-4 border-t border-surface-700/30 flex justify-end shrink-0">
					<button
						class="btn btn-sm preset-filled-primary-500"
						onclick={copyJson}>
						{copied ? 'Copied!' : 'Copy JSON'}
					</button>
				</div>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
{:else}
	<!-- Desktop: native dialog centered, renders in top layer -->
	<dialog
		bind:this={dialog}
		onclick={handleDialogClick}
		aria-label="JSON preview"
		class="m-auto w-full max-w-2xl max-h-[80vh] flex flex-col p-0
			rounded-[var(--radius-container)] bg-surface-100-900
			border border-surface-700/30
			backdrop:bg-black/60 backdrop:backdrop-blur-sm">
		<div class="flex items-center justify-between px-5 py-4 border-b border-surface-700/30 shrink-0">
			<p class="text-sm font-medium text-surface-950-50">JSON</p>
			<button
				class="btn btn-sm preset-tonal-surface"
				onclick={onclose}
				aria-label="Close">
				✕
			</button>
		</div>

		<div class="overflow-auto flex-1 p-5">
			<pre class="text-xs text-surface-300 font-mono leading-relaxed whitespace-pre">{json}</pre>
		</div>

		<div class="px-5 py-4 border-t border-surface-700/30 flex justify-end shrink-0">
			<button
				class="btn btn-sm preset-filled-primary-500"
				onclick={copyJson}>
				{copied ? 'Copied!' : 'Copy JSON'}
			</button>
		</div>
	</dialog>
{/if}
