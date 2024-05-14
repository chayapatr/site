/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'selector',
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						h1: {
							fontWeight: 500
						},
						h2: {
							fontWeight: 500
						},
						h3: {
							fontWeight: 500
						},
						h4: {
							fontWeight: 400
						}
					}
				}
			}
		}
	},

	plugins: [require('@tailwindcss/typography')]
};

module.exports = config;
