import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		browser: 'src/browser.ts',
		'cli/cli': 'src/cli/cli.ts'
	},
	format: ['esm', 'cjs'],
	dts: true,
	clean: true,
	splitting: false,
	sourcemap: true,
	outDir: 'dist'
});
