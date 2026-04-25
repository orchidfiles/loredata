<script lang="ts">
import IconAtSign from 'virtual:icons/lucide/at-sign';
import IconHouse from 'virtual:icons/lucide/house';
import IconPackage from 'virtual:icons/lucide/package';
import IconX from 'virtual:icons/lucide/x';
import IconGithub from 'virtual:icons/simple-icons/github';

import { contactLinks } from '$shared/contact-links';

import type { Component } from 'svelte';

interface UtilityLink {
	href?: string;
	label: string;
	icon: Component;
	external?: boolean;
	action?: 'contacts';
}

let dialog = $state<HTMLDialogElement | null>(null);
let isOpen = $state(false);

const utilityLinks: UtilityLink[] = [
	{
		href: '/',
		label: 'Home',
		icon: IconHouse
	},
	{
		href: 'https://github.com/orchidfiles/loredata',
		label: 'GitHub',
		icon: IconGithub,
		external: true
	},
	{
		href: 'https://www.npmjs.com/package/loredata',
		label: 'NPM',
		icon: IconPackage,
		external: true
	},
	{
		label: 'Contacts',
		icon: IconAtSign,
		action: 'contacts'
	}
];

$effect(() => {
	if (!dialog) {
		return;
	}

	if (isOpen) {
		dialog.showModal();

		return;
	}

	dialog.close();
});

function openDialog(): void {
	isOpen = true;
}

function closeDialog(): void {
	isOpen = false;
}

function handleDialogClick(event: MouseEvent): void {
	if (event.target === dialog) {
		closeDialog();
	}
}

function isActionLink(link: UtilityLink): boolean {
	if (link.action) {
		return true;
	}

	return false;
}
</script>

<div class="hidden lg:flex w-10 shrink-0 self-start sticky top-8 flex-col gap-2">
	{#each utilityLinks as link (link.label)}
		{#if isActionLink(link)}
			<button
				class="group relative flex items-center justify-end"
				onclick={openDialog}
				aria-label={link.label}>
				<div
					class="flex size-10 items-center justify-center rounded-full text-surface-400 transition-all duration-200
						group-hover:bg-surface-200-800 group-hover:text-surface-950-50">
					<link.icon class="size-5" />
				</div>
				<span
					class="pointer-events-none absolute right-12 whitespace-nowrap rounded-md bg-surface-800 px-2.5 py-1 text-xs text-surface-200
						opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
					{link.label}
				</span>
			</button>
		{:else if link.href}
			<a
				href={link.href}
				target={link.external ? '_blank' : undefined}
				rel={link.external ? 'noopener noreferrer' : undefined}
				aria-label={link.label}
				class="group relative flex items-center justify-end">
				<div
					class="flex size-10 items-center justify-center rounded-full text-surface-400 transition-all duration-200
						group-hover:bg-surface-200-800 group-hover:text-surface-950-50">
					<link.icon class="size-5" />
				</div>
				<span
					class="pointer-events-none absolute right-12 whitespace-nowrap rounded-md bg-surface-800 px-2.5 py-1 text-xs text-surface-200
						opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
					{link.label}
				</span>
			</a>
		{/if}
	{/each}
</div>

<dialog
	bind:this={dialog}
	onclick={handleDialogClick}
	onclose={closeDialog}
	aria-label="Contacts"
	class="m-auto w-full max-w-[22rem] p-0 rounded-[var(--radius-container)] bg-surface-100-900
		border border-surface-700/30 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
	<div class="flex items-center justify-between px-4 py-3 border-b border-surface-700/30">
		<p class="text-xs font-medium uppercase tracking-wide text-surface-400">Contacts</p>
		<button
			class="group flex size-8 items-center justify-center"
			onclick={closeDialog}
			aria-label="Close contacts">
			<span
				class="flex size-8 items-center justify-center rounded-full text-surface-400 transition-all duration-200
					group-hover:bg-surface-200-800 group-hover:text-surface-950-50">
				<IconX class="size-5.5" />
			</span>
		</button>
	</div>

	<div class="px-4 py-3">
		<ul class="space-y-2 text-base text-surface-300">
			{#each contactLinks as link (link.href)}
				<li class="leading-relaxed"
					>{link.name}:
					<a
						class="anchor"
						href={link.href}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noopener noreferrer' : undefined}>{link.value}</a
					></li>
			{/each}
		</ul>
	</div>
</dialog>
