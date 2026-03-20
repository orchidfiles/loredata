<script lang="ts">
interface Props {
	json: string;
	onclose: () => void;
}

let { json, onclose }: Props = $props();

let copied = $state(false);

function copyJson(): void {
	void navigator.clipboard.writeText(json).then(() => {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	});
}

function handleBackdropClick(event: MouseEvent): void {
	if (event.target === event.currentTarget) {
		onclose();
	}
}

function handleKeydown(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		onclose();
	}
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	aria-label="JSON preview">
	<div class="card preset-tonal-surface border border-surface-700/30 w-full max-w-2xl flex flex-col max-h-[80vh]">
		<div class="flex items-center justify-between px-5 py-4 border-b border-surface-700/30">
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

		<div class="px-5 py-4 border-t border-surface-700/30 flex justify-end">
			<button
				class="btn btn-sm preset-filled-primary-500"
				onclick={copyJson}>
				{copied ? 'Copied!' : 'Copy JSON'}
			</button>
		</div>
	</div>
</div>
