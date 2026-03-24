import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		prerender: {
			handleHttpError: 'warn'
		},
		alias: {
			$shared: 'src/shared',
			$components: 'src/components',
			$features: 'src/features',
			$layouts: 'src/layouts'
		}
	}
};

export default config;
