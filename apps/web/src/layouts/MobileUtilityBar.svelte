<script lang="ts">
import { Drawer } from 'vaul-svelte';
import IconAtSign from 'virtual:icons/lucide/at-sign';
import IconGithub from 'virtual:icons/simple-icons/github';

import { contactLinks } from '$shared/contact-links';

let drawerOpen = $state(false);
</script>

<div class="flex items-center gap-1">
	<a
		href="https://github.com/orchidfiles/loredata"
		target="_blank"
		rel="noopener noreferrer"
		aria-label="GitHub"
		class="flex size-10 items-center justify-center rounded-full text-surface-400 transition-all duration-200 hover:bg-surface-200-800 hover:text-surface-950-50">
		<IconGithub class="size-5" />
	</a>

	<button
		class="flex size-10 items-center justify-center rounded-full text-surface-400 transition-all duration-200 hover:bg-surface-200-800 hover:text-surface-950-50"
		onclick={() => {
			drawerOpen = true;
		}}
		aria-label="Contacts">
		<IconAtSign class="size-5" />
	</button>
</div>

<Drawer.Root bind:open={drawerOpen}>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content
			class="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl
				border border-surface-700/30 border-b-0 bg-surface-100-900">
			<div class="flex justify-center pt-3 pb-1">
				<div class="h-1.5 w-10 rounded-full bg-surface-400/50"></div>
			</div>

			<div class="flex items-center justify-between px-4 py-3 border-b border-surface-700/30">
				<p class="text-base font-medium uppercase tracking-wide text-surface-400">Contacts</p>
			</div>

			<div class="px-4 py-3 max-h-[60vh] overflow-auto">
				<ul class="space-y-2 text-lg text-surface-300">
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
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
