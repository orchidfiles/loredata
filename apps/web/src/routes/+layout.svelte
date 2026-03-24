<script lang="ts">
import '../app.css';

import SocialBar from '$layouts/SocialBar.svelte';

import type { Snippet } from 'svelte';

let { children }: { children: Snippet } = $props();
</script>

<main class="container mx-auto max-w-4xl px-4 py-8">
	{@render children()}
</main>
<SocialBar />
