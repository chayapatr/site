const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			typography: {
				lg: {
					css: {
						color: colors.neutral[950],
						a: {
							fontSize: '1.35rem',
							textDecoration: 'none',
							color: colors.purple[500],
							'&:hover': {
								backgroundColor: colors.yellow[300],
								color: colors.neutral[900]
							}
						},
						h2: {
							fontSize: '1.75rem',
							margin: '1.25rem 0 0.75rem 0',
							fontWeight: 500
						},
						h3: {
							fontSize: '1.2rem',
							margin: '1.25rem 0 0.75rem 0',
							fontWeight: 500
						},
						p: {
							marginBottom: '1rem'
						},
						img: {
							margin: '1rem 0'
						},
						ul: {
							paddingLeft: '1rem',
							color: '#000',
							margin: '1rem 0'
						},
						'ul > li': {
							paddingLeft: '0'
						}
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
}
