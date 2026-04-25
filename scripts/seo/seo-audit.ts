import { readFile } from 'node:fs/promises';
import path from 'node:path';

const siteOrigin = 'https://loredata.orchidfiles.com';

interface ExpectedPageMeta {
	filePath: string;
	artifactPath?: string;
	title: string;
	description: string;
	ogTitle: string;
	ogDescription: string;
	canonicalUrl: string;
	ogUrl: string;
	ogImage: string;
	twitterTitle: string;
	twitterDescription: string;
	twitterImage: string;
	twitterCard: string;
	primarySchemaType: string;
	hasBreadcrumbSchema: boolean;
}

const expectedPages: ExpectedPageMeta[] = [
	{
		filePath: 'index.html',
		artifactPath: '../../apps/web/.svelte-kit/output/prerendered/pages/index.html',
		title: 'LoreData — Generate lore-accurate personas from pop culture universes',
		description:
			'Replace generic placeholder users with recognizable character-based profiles for screenshots, UI mockups, demos, and seed data.',
		ogTitle: 'LoreData — Generate lore-accurate personas from pop culture universes',
		ogDescription:
			'Replace generic placeholder users with recognizable character-based profiles for screenshots, UI mockups, demos, and seed data.',
		canonicalUrl: `${siteOrigin}/`,
		ogUrl: `${siteOrigin}/`,
		ogImage: `${siteOrigin}/og/home.png`,
		twitterTitle: 'LoreData — Generate lore-accurate personas from pop culture universes',
		twitterDescription:
			'Replace generic placeholder users with recognizable character-based profiles for screenshots, UI mockups, demos, and seed data.',
		twitterImage: `${siteOrigin}/og/home.png`,
		twitterCard: 'summary_large_image',
		primarySchemaType: 'WebSite',
		hasBreadcrumbSchema: false
	},
	{
		filePath: 'interests.html',
		title: 'All interests — LoreData',
		description: 'Browse all interests across pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more.',
		ogTitle: 'All interests — LoreData',
		ogDescription: 'Browse all interests across pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more.',
		canonicalUrl: `${siteOrigin}/interests`,
		ogUrl: `${siteOrigin}/interests`,
		ogImage: `${siteOrigin}/og/home.png`,
		twitterTitle: 'All interests — LoreData',
		twitterDescription:
			'Browse all interests across pop culture universes: Breaking Bad, Game of Thrones, Harry Potter and more.',
		twitterImage: `${siteOrigin}/og/home.png`,
		twitterCard: 'summary',
		primarySchemaType: 'CollectionPage',
		hasBreadcrumbSchema: true
	},
	{
		filePath: 'universes/the-office.html',
		title: 'Generate The Office personas — LoreData',
		description: 'Use recognizable The Office character profiles for screenshots, UI mockups, demos, and seed data.',
		ogTitle: 'Generate The Office personas — LoreData',
		ogDescription: 'Use recognizable The Office character profiles for screenshots, UI mockups, demos, and seed data.',
		canonicalUrl: `${siteOrigin}/universes/the-office`,
		ogUrl: `${siteOrigin}/universes/the-office`,
		ogImage: `${siteOrigin}/og/universe-the-office.png`,
		twitterTitle: 'Generate The Office personas — LoreData',
		twitterDescription: 'Use recognizable The Office character profiles for screenshots, UI mockups, demos, and seed data.',
		twitterImage: `${siteOrigin}/og/universe-the-office.png`,
		twitterCard: 'summary_large_image',
		primarySchemaType: 'CollectionPage',
		hasBreadcrumbSchema: false
	},
	{
		filePath: 'universes/the-office/michael-scott.html',
		title: 'Generate Michael Scott profile from The Office — LoreData',
		description: 'Use a recognizable Michael Scott profile from The Office for screenshots, UI mockups, demos, and seed data.',
		ogTitle: 'Generate Michael Scott profile from The Office — LoreData',
		ogDescription: 'Use a recognizable Michael Scott profile from The Office for screenshots, UI mockups, demos, and seed data.',
		canonicalUrl: `${siteOrigin}/universes/the-office/michael-scott`,
		ogUrl: `${siteOrigin}/universes/the-office/michael-scott`,
		ogImage: `${siteOrigin}/og/char-the-office-michael-scott.png`,
		twitterTitle: 'Generate Michael Scott profile from The Office — LoreData',
		twitterDescription:
			'Use a recognizable Michael Scott profile from The Office for screenshots, UI mockups, demos, and seed data.',
		twitterImage: `${siteOrigin}/og/char-the-office-michael-scott.png`,
		twitterCard: 'summary_large_image',
		primarySchemaType: 'ProfilePage',
		hasBreadcrumbSchema: true
	},
	{
		filePath: 'interests/chemistry.html',
		title: 'Characters interested in chemistry — LoreData',
		description: 'Use recognizable character profiles interested in chemistry for screenshots, UI mockups, demos, and seed data.',
		ogTitle: 'Characters interested in chemistry — LoreData',
		ogDescription:
			'Use recognizable character profiles interested in chemistry for screenshots, UI mockups, demos, and seed data.',
		canonicalUrl: `${siteOrigin}/interests/chemistry`,
		ogUrl: `${siteOrigin}/interests/chemistry`,
		ogImage: `${siteOrigin}/og/home.png`,
		twitterTitle: 'Characters interested in chemistry — LoreData',
		twitterDescription:
			'Use recognizable character profiles interested in chemistry for screenshots, UI mockups, demos, and seed data.',
		twitterImage: `${siteOrigin}/og/home.png`,
		twitterCard: 'summary',
		primarySchemaType: 'CollectionPage',
		hasBreadcrumbSchema: true
	},
	{
		filePath: 'locations/scranton.html',
		title: 'Scranton — LoreData',
		description: 'Browse fictional universes set in Scranton for screenshots, UI mockups, demos, and seed data.',
		ogTitle: 'Scranton — LoreData',
		ogDescription: 'Browse fictional universes set in Scranton for screenshots, UI mockups, demos, and seed data.',
		canonicalUrl: `${siteOrigin}/locations/scranton`,
		ogUrl: `${siteOrigin}/locations/scranton`,
		ogImage: `${siteOrigin}/og/home.png`,
		twitterTitle: 'Scranton — LoreData',
		twitterDescription: 'Browse fictional universes set in Scranton for screenshots, UI mockups, demos, and seed data.',
		twitterImage: `${siteOrigin}/og/home.png`,
		twitterCard: 'summary',
		primarySchemaType: 'CollectionPage',
		hasBreadcrumbSchema: true
	}
];
const buildRoot = path.resolve(import.meta.dirname, '../../apps/web/build');
const ogWidth = '1200';
const ogHeight = '630';

class SeoAudit {
	static async run(): Promise<void> {
		const failures: string[] = [];

		for (const expectedPage of expectedPages) {
			const content = await this.readPageFile(expectedPage);

			this.assertMeta(content, expectedPage, failures);
		}

		const sitemapContent = await this.readBuildFile('sitemap.xml');

		if (!this.hasToken(sitemapContent, '/interests/')) {
			failures.push('sitemap.xml: missing interests routes');
		}

		if (!this.hasToken(sitemapContent, '/locations/')) {
			failures.push('sitemap.xml: missing locations routes');
		}

		if (failures.length > 0) {
			console.error('SEO audit failed:');

			for (const failure of failures) {
				console.error(`- ${failure}`);
			}

			process.exit(1);
		}

		console.log('SEO audit passed.');
	}

	static hasToken(content: string, token: string): boolean {
		return content.includes(token);
	}

	static async readBuildFile(relativePath: string): Promise<string> {
		const filePath = path.resolve(buildRoot, relativePath);

		return readFile(filePath, 'utf8');
	}

	static async readPageFile(expectedPage: ExpectedPageMeta): Promise<string> {
		if (expectedPage.artifactPath) {
			const filePath = path.resolve(import.meta.dirname, expectedPage.artifactPath);

			return readFile(filePath, 'utf8');
		}

		return this.readBuildFile(expectedPage.filePath);
	}

	static escapeRegExp(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	static readTitle(content: string): string | null {
		const match = /<title>([^<]+)<\/title>/.exec(content);

		if (!match) {
			return null;
		}

		return match[1];
	}

	static readMetaContent(content: string, attribute: 'name' | 'property' | 'rel', key: string): string | null {
		const escapedKey = this.escapeRegExp(key);
		const pattern = new RegExp(`<[^>]+${attribute}="${escapedKey}"[^>]+content="([^"]*)"[^>]*>`, 'i');
		const match = content.match(pattern);

		if (!match) {
			return null;
		}

		return match[1];
	}

	static readLinkHref(content: string, rel: string): string | null {
		const escapedRel = this.escapeRegExp(rel);
		const pattern = new RegExp(`<link[^>]+rel="${escapedRel}"[^>]+href="([^"]*)"[^>]*>`, 'i');
		const match = content.match(pattern);

		if (!match) {
			return null;
		}

		return match[1];
	}

	static assertEqual(actual: string | null, expected: string, label: string, relativePath: string, failures: string[]): void {
		if (actual === null) {
			failures.push(`${relativePath}: missing ${label}`);

			return;
		}

		if (actual !== expected) {
			failures.push(`${relativePath}: invalid ${label}`);
		}
	}

	static assertMeta(content: string, expected: ExpectedPageMeta, failures: string[]): void {
		this.assertEqual(this.readTitle(content), expected.title, 'title', expected.filePath, failures);
		this.assertEqual(
			this.readMetaContent(content, 'name', 'description'),
			expected.description,
			'description',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'property', 'og:title'),
			expected.ogTitle,
			'og:title',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'property', 'og:description'),
			expected.ogDescription,
			'og:description',
			expected.filePath,
			failures
		);
		this.assertEqual(this.readMetaContent(content, 'property', 'og:url'), expected.ogUrl, 'og:url', expected.filePath, failures);
		this.assertEqual(
			this.readMetaContent(content, 'property', 'og:image'),
			expected.ogImage,
			'og:image',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'property', 'og:image:width'),
			ogWidth,
			'og:image:width',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'property', 'og:image:height'),
			ogHeight,
			'og:image:height',
			expected.filePath,
			failures
		);
		this.assertEqual(this.readLinkHref(content, 'canonical'), expected.canonicalUrl, 'canonical', expected.filePath, failures);
		this.assertEqual(
			this.readMetaContent(content, 'name', 'twitter:card'),
			expected.twitterCard,
			'twitter:card',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'name', 'twitter:title'),
			expected.twitterTitle,
			'twitter:title',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'name', 'twitter:description'),
			expected.twitterDescription,
			'twitter:description',
			expected.filePath,
			failures
		);
		this.assertEqual(
			this.readMetaContent(content, 'name', 'twitter:image'),
			expected.twitterImage,
			'twitter:image',
			expected.filePath,
			failures
		);

		if (!this.hasToken(content, 'type="application/ld+json"')) {
			failures.push(`${expected.filePath}: missing JSON-LD`);
		}

		if (!this.hasToken(content, `"@type":"${expected.primarySchemaType}"`)) {
			failures.push(`${expected.filePath}: missing ${expected.primarySchemaType} JSON-LD`);
		}

		if (expected.hasBreadcrumbSchema && !this.hasToken(content, '"@type":"BreadcrumbList"')) {
			failures.push(`${expected.filePath}: missing BreadcrumbList JSON-LD`);
		}
	}
}

await SeoAudit.run();
