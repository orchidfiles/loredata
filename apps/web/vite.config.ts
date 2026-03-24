import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 5160
	},
	resolve: {
		alias: {
			$data: path.resolve('../../packages/loredata/data')
		}
	},
	plugins: [tailwindcss(), sveltekit(), Icons({ compiler: 'svelte', autoInstall: false })]
});
