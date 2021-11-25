import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import image from 'svelte-image';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		image({
			sizes: [400, 800],
			outputDir: 'g/',
			publicDir: './static/',
			processFolders: ['./'],
			processFoldersSizes: [400, 800]
		}),
		preprocess()
	],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				include: ['blurhash']
			},
			files: {
				assets: 'src/static'
			},
			resolve: {
				alias: {
					$static: 'src/static'
				}
			}
		}
	}
};

export default config;
