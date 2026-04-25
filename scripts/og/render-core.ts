import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import type { CharacterData, UniverseData } from 'loredata';

const config = {
	width: 1200,
	height: 630,
	fontRegularUrl: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff',
	fontBoldUrl: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff',
	fontItalicUrl: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.woff'
} as const;

type SatoriRoot = Parameters<typeof satori>[0];

interface BackgroundOptions {
	readingZone?: boolean;
	overlayOpacity?: number;
}

export interface FontData {
	regular: ArrayBuffer;
	bold: ArrayBuffer;
	italic: ArrayBuffer;
}

export type RenderJob =
	| { kind: 'home' }
	| { kind: 'universe'; universe: UniverseData; backdrop: string | null }
	| { kind: 'character'; universe: UniverseData; character: CharacterData; backdrop: string | null };

export class RenderCore {
	static async loadFonts(): Promise<FontData> {
		const resRegular = await fetch(config.fontRegularUrl);
		const resBold = await fetch(config.fontBoldUrl);
		const resItalic = await fetch(config.fontItalicUrl);

		if (!resRegular.ok) {
			throw new Error(`Failed to load regular font: ${config.fontRegularUrl} (${resRegular.status})`);
		}

		if (!resBold.ok) {
			throw new Error(`Failed to load bold font: ${config.fontBoldUrl} (${resBold.status})`);
		}

		if (!resItalic.ok) {
			throw new Error(`Failed to load italic font: ${config.fontItalicUrl} (${resItalic.status})`);
		}

		const regular = await resRegular.arrayBuffer();
		const bold = await resBold.arrayBuffer();
		const italic = await resItalic.arrayBuffer();

		const result: FontData = { regular, bold, italic };

		return result;
	}

	static async renderToPng(job: RenderJob, fonts: FontData): Promise<Buffer> {
		let root: SatoriRoot;

		if (job.kind === 'home') {
			root = this.homeTemplate();
		} else if (job.kind === 'universe') {
			root = this.universeTemplate(job.universe, job.backdrop);
		} else {
			root = this.characterTemplate(job.character, job.universe, job.backdrop);
		}

		return this.renderPng(root, fonts);
	}

	private static satoriFonts(fonts: FontData) {
		const result = [
			{ name: 'Inter', data: fonts.regular, weight: 400 as const },
			{ name: 'Inter', data: fonts.bold, weight: 700 as const },
			{ name: 'Inter', data: fonts.italic, weight: 400 as const, style: 'italic' as const }
		];

		return result;
	}

	private static truncate(text: string, maxLength: number): string {
		if (text.length <= maxLength) {
			return text;
		}

		const sliced = text.slice(0, maxLength - 1);

		return `${sliced}…`;
	}

	private static async renderPng(element: SatoriRoot, fonts: FontData): Promise<Buffer> {
		const svg = await satori(element, {
			width: config.width,
			height: config.height,
			fonts: this.satoriFonts(fonts)
		});

		const resvg = new Resvg(svg, {
			fitTo: { mode: 'width', value: config.width }
		});

		const png = resvg.render().asPng();

		return png;
	}

	private static backgroundLayer(backdropBase64: string | null, options?: BackgroundOptions): SatoriRoot[] {
		if (!backdropBase64) {
			return [];
		}

		let overlayOpacity = 0.65;

		if (options !== undefined) {
			if (options.overlayOpacity !== undefined) {
				overlayOpacity = options.overlayOpacity;
			}
		}

		const overlayBackground = `rgba(0, 0, 0, ${overlayOpacity})`;

		const img: SatoriRoot = {
			type: 'img',
			props: {
				src: backdropBase64,
				style: {
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: 'top'
				}
			}
		};

		const overlay: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					background: overlayBackground
				}
			}
		};

		const layers: SatoriRoot[] = [img, overlay];

		if (options !== undefined) {
			if (options.readingZone === true) {
				const scrim: SatoriRoot = {
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							bottom: 0,
							left: 0,
							width: '100%',
							height: '58%',
							background:
								'linear-gradient(to bottom, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.82) 42%, rgba(15, 23, 42, 0.97) 100%)'
						}
					}
				};

				layers.push(scrim);
			}
		}

		return layers;
	}

	private static footerLabel(prominent: boolean): SatoriRoot {
		let fontSize: number;
		let color: string;
		let fontWeight: number;

		if (prominent) {
			fontSize = 24;
			color = 'rgba(255,255,255,0.92)';
			fontWeight = 600;
		} else {
			fontSize = 20;
			color = 'rgba(255,255,255,0.58)';
			fontWeight = 400;
		}

		const result: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					bottom: 28,
					right: 40,
					color,
					fontSize,
					fontWeight,
					letterSpacing: 0.3
				},
				children: 'loredata.orchidfiles.com'
			}
		};

		return result;
	}

	private static homeTemplate(): SatoriRoot {
		const titleBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: { fontSize: 64, fontWeight: 700, marginBottom: 12 },
				children: 'LoreData'
			}
		};

		const hookBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 34,
					fontWeight: 600,
					color: 'rgba(255,255,255,0.95)',
					lineHeight: 1.25,
					marginBottom: 14,
					maxWidth: '92%'
				},
				children: 'Generate lore-accurate personas from pop culture universes.'
			}
		};

		const bodyBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: { fontSize: 24, color: 'rgba(255,255,255,0.78)', lineHeight: 1.45, maxWidth: '94%' },
				children:
					'Replace generic placeholder users with recognizable character-based profiles for screenshots, UI mockups, demos, and seed data.'
			}
		};

		const children: SatoriRoot[] = [titleBlock, hookBlock, bodyBlock, this.footerLabel(false)];

		const result: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '60px',
					background: '#0f172a',
					color: 'white',
					fontFamily: 'Inter'
				},
				children
			}
		};

		return result;
	}

	private static universeTemplate(universe: UniverseData, backdropBase64: string | null): SatoriRoot {
		const metaParts: string[] = [];

		if (universe.year !== undefined) {
			metaParts.push(String(universe.year));
		}

		for (const g of universe.genre.slice(0, 3)) {
			metaParts.push(g);
		}

		const meta = metaParts.join(' · ');

		const nameBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 48,
					fontWeight: 700,
					color: 'rgba(255,255,255,0.9)',
					lineHeight: 1.08
				},
				children: universe.name
			}
		};

		const columnChildren: SatoriRoot[] = [nameBlock];

		if (meta.length > 0) {
			const metaBlock: SatoriRoot = {
				type: 'div',
				props: {
					style: {
						fontSize: 22,
						color: 'rgba(255,255,255,0.68)',
						lineHeight: 1.25
					},
					children: meta
				}
			};

			columnChildren.push(metaBlock);
		}

		const descBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 34,
					color: 'rgba(255,255,255,0.98)',
					lineHeight: 1.28,
					maxWidth: '88%',
					fontWeight: 700,
					letterSpacing: -0.2
				},
				children: `Use recognizable ${universe.name} character profiles for screenshots, UI mockups, demos, and seed data.`
			}
		};

		columnChildren.push(descBlock);

		const column: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: 14,
					position: 'relative'
				},
				children: columnChildren
			}
		};

		const rootChildren: SatoriRoot[] = [...this.backgroundLayer(backdropBase64), column, this.footerLabel(false)];

		const result: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					padding: '60px',
					background: '#0f172a',
					color: 'white',
					fontFamily: 'Inter',
					position: 'relative'
				},
				children: rootChildren
			}
		};

		return result;
	}

	private static characterTemplate(character: CharacterData, universe: UniverseData, backdropBase64: string | null): SatoriRoot {
		const nameParts: string[] = [];

		if (character.firstName) {
			nameParts.push(character.firstName);
		}

		if (character.lastName) {
			nameParts.push(character.lastName);
		}

		const name = nameParts.join(' ');

		let quote: string | null = null;

		if (character.quotes.length > 0) {
			quote = this.truncate(character.quotes[0], 120);
		}

		const universeLabel: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					top: 36,
					left: 48,
					fontSize: 28,
					fontWeight: 600,
					color: 'rgba(255,255,255,0.92)',
					maxWidth: '75%',
					lineHeight: 1.2
				},
				children: universe.name
			}
		};

		const projectLineCharacter: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 34,
					color: 'rgba(255,255,255,0.98)',
					lineHeight: 1.28,
					maxWidth: '94%',
					fontWeight: 700,
					letterSpacing: -0.2
				},
				children: `Use a recognizable ${name} profile from ${universe.name} for screenshots, UI mockups, demos, and seed data.`
			}
		};

		const nameBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 46,
					color: 'rgba(255,255,255,0.9)',
					fontWeight: 700,
					lineHeight: 1.08
				},
				children: name
			}
		};

		const professionBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 26,
					color: 'rgba(255,255,255,0.74)',
					fontWeight: 500,
					lineHeight: 1.25
				},
				children: character.profession
			}
		};

		const columnChildren: SatoriRoot[] = [nameBlock, professionBlock];

		if (quote !== null) {
			const quoteBlock: SatoriRoot = {
				type: 'div',
				props: {
					style: {
						fontSize: 34,
						color: 'rgba(255,255,255,0.96)',
						fontStyle: 'italic',
						fontWeight: 400,
						lineHeight: 1.35,
						maxWidth: '92%',
						marginTop: 4
					},
					children: `“${quote}”`
				}
			};

			columnChildren.push(quoteBlock);
		}
		columnChildren.push(projectLineCharacter);

		const column: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: 14,
					position: 'relative',
					paddingBottom: 8
				},
				children: columnChildren
			}
		};

		const characterBgOptions: BackgroundOptions = {
			readingZone: true,
			overlayOpacity: 0.58
		};

		const rootChildren: SatoriRoot[] = [
			...this.backgroundLayer(backdropBase64, characterBgOptions),
			universeLabel,
			column,
			this.footerLabel(true)
		];

		const result: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					padding: '44px 56px 88px 56px',
					background: '#0f172a',
					color: 'white',
					fontFamily: 'Inter',
					position: 'relative'
				},
				children: rootChildren
			}
		};

		return result;
	}
}
