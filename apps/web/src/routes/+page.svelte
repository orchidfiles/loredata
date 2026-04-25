<script lang="ts">
import { config } from '$shared/config';

import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const ogPageUrl = `${config.siteOrigin}/`;
const ogImageUrl = `${config.siteOrigin}/og/home.png`;
const canonicalUrl = ogPageUrl;
const pageDescription =
	'Replace generic placeholder users with recognizable character-based profiles for screenshots, UI mockups, demos, and seed data.';
const websiteSchema = JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'LoreData',
	url: canonicalUrl,
	description: pageDescription
});
const websiteSchemaScript = `<script type="application/ld+json">${websiteSchema}<\/script>`;
</script>

<svelte:head>
	<title>LoreData — Generate lore-accurate personas from pop culture universes</title>
	<meta
		name="description"
		content={pageDescription} />
	<meta
		property="og:title"
		content="LoreData — Generate lore-accurate personas from pop culture universes" />
	<meta
		property="og:description"
		content={pageDescription} />
	<meta
		property="og:type"
		content="website" />
	<meta
		property="og:url"
		content={ogPageUrl} />
	<meta
		property="og:image"
		content={ogImageUrl} />
	<meta
		property="og:image:width"
		content={String(config.og.width)} />
	<meta
		property="og:image:height"
		content={String(config.og.height)} />
	<link
		rel="canonical"
		href={canonicalUrl} />
	<meta
		name="twitter:card"
		content="summary_large_image" />
	<meta
		name="twitter:title"
		content="LoreData — Generate lore-accurate personas from pop culture universes" />
	<meta
		name="twitter:description"
		content={pageDescription} />
	<meta
		name="twitter:image"
		content={ogImageUrl} />
	{@html websiteSchemaScript}
</svelte:head>

<div class="space-y-6">
	<div class="space-y-4">
		<h1 class="text-3xl font-semibold text-surface-950-50">
			Generate lore-accurate personas from
			<span class="whitespace-nowrap">pop culture universes</span>
		</h1>
		<p class="text-surface-950-50 text-lg">
			Replace generic placeholder users with recognizable character-based profiles for screenshots, mockups, demos, and seed data.
		</p>
		<p class="text-surface-950-100 text-lg">
			Breaking Bad, Game of Thrones, Star Wars, Sherlock, and {data.manifest.length - 4} more universes.
		</p>
		<p class="text-surface-950-50">
			<a
				class="anchor"
				href="https://github.com/orchidfiles/loredata"
				target="_blank"
				rel="noopener">GitHub</a>
		</p>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Why LoreData</h2>
		<ul class="landing-list">
			<li>
				Generic demo users like John Doe, Jane Smith, and test@example.com work for smoke tests but feel flat in real product
				demos
			</li>
			<li>LoreData generates recognizable personas from a single fictional universe, so fields stay coherent by design</li>
			<li>Deterministic output via seed keeps fixtures stable across runs</li>
			<li>Works in Node.js, browser, and as a CLI tool with no network requests</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Persona example</h2>
		<div class="text-sm [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4">
			{@html data.exampleHtml}
		</div>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Group example</h2>
		<div class="text-sm [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4">
			{@html data.groupExampleHtml}
		</div>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Universes</h2>
		<div class="text-sm [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4">
			{@html data.universesHtml}
		</div>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">CLI</h2>
		<div class="text-sm [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4">
			{@html data.cliHtml}
		</div>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Who this is for</h2>
		<ul class="landing-list">
			<li>Developers filling a local database or Storybook stories with recognizable personas</li>
			<li>Designers building mockups who do not want to use John Doe again</li>
			<li>QA engineers creating more expressive test accounts with different profiles</li>
			<li>Tutorial and conference talk authors who want screenshots that feel less generic</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Links</h2>
		<ul class="landing-list">
			<li
				>Source code: <a
					class="anchor"
					href="https://github.com/orchidfiles/loredata"
					target="_blank"
					rel="noopener">github.com/orchidfiles/loredata</a
				></li>
			<li
				>Package: <a
					class="anchor"
					href="https://www.npmjs.com/package/loredata"
					target="_blank"
					rel="noopener">npmjs.com/package/loredata</a
				></li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Contact</h2>
		<ul class="landing-list">
			<li
				>Email: <a
					class="anchor"
					href="mailto:orchid@orchidfiles.com">orchid@orchidfiles.com</a
				></li>
			<li
				>Telegram: <a
					class="anchor"
					href="https://t.me/askorchid"
					target="_blank"
					rel="noopener">@askorchid</a
				></li>
			<li
				>Blog: <a
					class="anchor"
					href="https://orchidfiles.com"
					target="_blank"
					rel="noopener">orchidfiles.com</a
				></li>
		</ul>
	</div>
</div>
