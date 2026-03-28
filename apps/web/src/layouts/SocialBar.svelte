<script lang="ts">
import IconHome from 'virtual:icons/lucide/house';
import IconMail from 'virtual:icons/lucide/mail';
import IconGithub from 'virtual:icons/simple-icons/github';
import IconTelegram from 'virtual:icons/simple-icons/telegram';
import IconTwitter from 'virtual:icons/simple-icons/x';

import type { Component } from 'svelte';

interface SocialLink {
	href: string;
	label: string;
	icon: Component;
	external?: boolean;
}

const links: SocialLink[] = [
	{
		href: 'https://orchidfiles.com',
		label: 'orchidfiles.com',
		icon: IconHome,
		external: true
	},
	{
		href: 'https://github.com/orchidfiles/loredata',
		label: 'GitHub',
		icon: IconGithub,
		external: true
	},
	{
		href: 'https://x.com/orchidcode',
		label: 'Twitter / X',
		icon: IconTwitter,
		external: true
	},
	{
		href: 'mailto:orchid@orchidfiles.com',
		label: 'Email',
		icon: IconMail
	},
	{
		href: 'https://t.me/askorchid',
		label: 'Telegram',
		icon: IconTelegram,
		external: true
	}
];
</script>

<div class="hidden lg:flex fixed bottom-6 left-6 z-50 flex-col gap-1">
	{#each links as link (link.href)}
		<a
			href={link.href}
			target={link.external ? '_blank' : undefined}
			rel={link.external ? 'noopener noreferrer' : undefined}
			aria-label={link.label}
			class="group relative flex items-center">
			<div
				class="flex size-9 items-center justify-center rounded-full text-surface-400 transition-all duration-200
					group-hover:bg-surface-700/60 group-hover:text-primary-400">
				<link.icon class="size-[18px]" />
			</div>
			<span
				class="pointer-events-none absolute left-11 whitespace-nowrap rounded-md bg-surface-800 px-2.5 py-1 text-xs text-surface-200
					opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
				{link.label}
			</span>
		</a>
	{/each}
</div>
