import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import type { CharacterData, UniverseData } from 'loredata';

const config = {
	width: 1200,
	height: 630,
	fontRegularUrl: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff',
	fontBoldUrl: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'
} as const;

type SatoriRoot = Parameters<typeof satori>[0];

interface BackgroundOptions {
	readingZone?: boolean;
	overlayOpacity?: number;
}

export interface FontData {
	regular: ArrayBuffer;
	bold: ArrayBuffer;
}

export type RenderJob =
	| { kind: 'home' }
	| { kind: 'universe'; universe: UniverseData; backdrop: string | null }
	| { kind: 'character'; universe: UniverseData; character: CharacterData; backdrop: string | null };

export class RenderCore {
	static async loadFonts(): Promise<FontData> {
		const resRegular = await fetch(config.fontRegularUrl);
		const resBold = await fetch(config.fontBoldUrl);

		if (!resRegular.ok) {
			throw new Error(`Failed to load regular font: ${config.fontRegularUrl} (${resRegular.status})`);
		}

		if (!resBold.ok) {
			throw new Error(`Failed to load bold font: ${config.fontBoldUrl} (${resBold.status})`);
		}

		const regular = await resRegular.arrayBuffer();
		const bold = await resBold.arrayBuffer();

		const result: FontData = { regular, bold };

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
			{ name: 'Inter', data: fonts.bold, weight: 700 as const }
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
				children: 'Coherent mock data from fictional universes.'
			}
		};

		const bodyBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: { fontSize: 24, color: 'rgba(255,255,255,0.78)', lineHeight: 1.45, maxWidth: '94%' },
				children: 'Node.js, CLI, or browser — story data ships with the install; no requests when you generate.'
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
				style: { fontSize: 56, fontWeight: 700 },
				children: universe.name
			}
		};

		const columnChildren: SatoriRoot[] = [nameBlock];

		if (meta.length > 0) {
			const metaBlock: SatoriRoot = {
				type: 'div',
				props: {
					style: { fontSize: 24, color: 'rgba(255,255,255,0.7)' },
					children: meta
				}
			};

			columnChildren.push(metaBlock);
		}

		const descBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 22,
					color: 'rgba(255,255,255,0.8)',
					lineHeight: 1.4,
					maxWidth: '80%'
				},
				children: this.truncate(universe.description, 160)
			}
		};

		columnChildren.push(descBlock);

		const projectLineUniverse: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 20,
					color: 'rgba(255,255,255,0.72)',
					marginTop: 12,
					lineHeight: 1.35,
					maxWidth: '92%',
					fontWeight: 500
				},
				children: 'Name, email, address, and quote stay in one world.'
			}
		};

		columnChildren.push(projectLineUniverse);

		const column: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
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

		const nameBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: { fontSize: 72, fontWeight: 700, lineHeight: 1.05 },
				children: name
			}
		};

		const professionBlock: SatoriRoot = {
			type: 'div',
			props: {
				style: { fontSize: 32, color: 'rgba(255,255,255,0.9)', fontWeight: 500, lineHeight: 1.25 },
				children: character.profession
			}
		};

		const columnChildren: SatoriRoot[] = [nameBlock, professionBlock];

		if (quote !== null) {
			const quoteBlock: SatoriRoot = {
				type: 'div',
				props: {
					style: {
						fontSize: 30,
						color: 'rgba(255,255,255,0.88)',
						fontStyle: 'italic',
						lineHeight: 1.35,
						maxWidth: '92%',
						marginTop: 8
					},
					children: `"${quote}"`
				}
			};

			columnChildren.push(quoteBlock);
		}

		const projectLineCharacter: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					fontSize: 20,
					color: 'rgba(255,255,255,0.72)',
					marginTop: 12,
					lineHeight: 1.35,
					maxWidth: '94%',
					fontWeight: 500
				},
				children: 'A coherent persona built from this character’s universe.'
			}
		};

		columnChildren.push(projectLineCharacter);

		const column: SatoriRoot = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: 18,
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
