<script lang="ts">
import { config } from '$shared/config';

import type { LayoutData } from './$types';

let { data }: { data: LayoutData } = $props();

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
		<h1 class="text-3xl font-semibold text-surface-950-50">Generate lore-accurate personas from pop culture universes</h1>
		<p class="text-surface-950-50 text-lg"
			>Pick a universe. Each generated persona gets a matching name, email, address, job, and quote from that world.</p>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Who it's for</h2>
		<ul class="landing-list">
			<li>Developers who seed databases or fill UI mockups with test data</li>
			<li>Designers who need realistic profiles in prototypes and screenshots</li>
			<li>QA engineers testing forms with varied but coherent personas</li>
			<li>Content creators who need recognizable data for tutorials, talks, and documentation screenshots</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Why LoreData</h2>
		<ul class="landing-list">
			<li>Recognizable characters make demos and screenshots self-explanatory</li>
			<li>Deterministic output via seed keeps fixtures stable across runs</li>
			<li>Works in Node.js, browser, and as a CLI tool</li>
			<li>No network requests, all data is bundled locally</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">What you get</h2>
		<ul class="landing-list">
			<li>{data.manifest.length} universes: Breaking Bad, The Sopranos, Game of Thrones, Sherlock, and more</li>
			<li>Each persona: name, username, email, address, profession, interests, quote, symbol, color</li>
			<li
				>Filter by interest or name: <code class="code text-surface-950-50">loredata person --interests chemistry,cooking</code
				></li>
			<li
				>Separate browser entry point <code class="code text-surface-950-50">loredata/browser</code> with no Node.js dependencies</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Quick start</h2>
		<ul class="landing-list">
			<li><code class="code text-surface-950-50">npm install -g loredata</code></li>
			<li><code class="code text-surface-950-50">loredata person --universe sherlock</code></li>
		</ul>
		<pre class="pre bg-gray-200 text-surface-950"
			>&#123;
  "firstName": "Sherlock",
  "lastName": "Holmes",
  "username": "high_functioning_sociopath",
  "email": "science_of_deduction@detective-consulting.net",
  "profession": "Consulting detective",
  "interests": ["deduction", "forensic science", "violin", "chemistry"],
  "quote": "Dear God. What is it like in your funny little brains? It must be so boring.",
  "symbol": "🔬",
  "address": &#123; "street": "221B Baker Street", "city": "London", "country": "GB" &#125;
&#125;</pre>
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
			<li>Open source under MIT, PRs with new universes are welcome</li>
		</ul>
	</div>

	<div class="landing-section">
		<h2 class="landing-heading">Contacts</h2>
		<div class="space-y-1 text-surface-950-50">
			<p
				>Email: <a
					class="anchor"
					href="mailto:orchid@orchidfiles.com">orchid@orchidfiles.com</a
				></p>
			<p
				>Telegram: <a
					class="anchor"
					href="https://t.me/askorchid"
					target="_blank"
					rel="noopener">@askorchid</a
				></p>
			<p
				>Blog: <a
					class="anchor"
					href="https://orchidfiles.com"
					target="_blank"
					rel="noopener">orchidfiles.com</a
				></p>
		</div>
	</div>
</div>
