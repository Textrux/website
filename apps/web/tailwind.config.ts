import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
				'brand-primary': '#00aeef',
				'brand-primary-dark': '#0099d3',
				'brand-dark': '#141414',
				'brand-orange': '#ED6430',
				'brand-yellow': '#FFDF63',
				'brand-magenta': '#C63663',
				'brand-lightgray': '#f8f9fa',
				'brand-beige': '#f8f5f2',
				instagram: '#E1306C',
				twitter: '#1DA1F2',
				tiktok: '#000000',
				youtube: '#FF0000',
				facebook: '#316FF6',
				pinterest: '#bd081c',
				linkedin: '#0077b5'
			},
			boxShadow: {
				'hard-left': '-8px 8px 0px 0px #00aeef',
				bootstrap: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
				button: '0 13px 39px 0 rgba(0, 123, 255, 0.3)'
			},
			textShadow: {
				sm: '0 2px 8px var(--tw-shadow-color)',
				DEFAULT: '0 12px 48px var(--tw-shadow-color)',
				lg: '0 20px 52px var(--tw-shadow-color)'
			},
			fontFamily: {
				northwell: ['var(--font-northwell)']
			},
			screens: {
				'3xl': '1700px'
			},
			animation: {
				blob: 'blob 7s infinite'
			},
			keyframes: {
				blob: {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)'
					},
					'33%': {
						transform: 'translate(30px, -50px) scale(1.1)'
					},
					'66%': {
						transform: 'translate(-20px, 20px) scale(0.9)'
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)'
					}
				}
			},
			borderWidth: {
				'0.5': '0.5px'
			}
    },
    safelist: ['bg-yellow-300'],
		plugins: [
			plugin(function ({ matchUtilities, theme }) {
				matchUtilities(
					{
						'text-shadow': (value) => ({
							textShadow: value
						})
					},
					{ values: theme('textShadow') }
				);
			})
		]
  },
};
export default config;
