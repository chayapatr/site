/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'selector',
	theme: {
		extend: {}
	},

	plugins: [require('@tailwindcss/typography')]
};

module.exports = config;
