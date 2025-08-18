
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'cal-sans': ['Cal Sans', 'Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'running-primary': {
					DEFAULT: 'hsl(var(--running-primary))',
					foreground: 'hsl(var(--running-primary-foreground))',
					light: 'hsl(var(--running-primary-light))',
					dark: 'hsl(var(--running-primary-dark))'
				},
				'running-secondary': {
					DEFAULT: 'hsl(var(--running-secondary))',
					foreground: 'hsl(var(--running-secondary-foreground))',
					light: 'hsl(var(--running-secondary-light))',
					dark: 'hsl(var(--running-secondary-dark))'
				},
				'running-accent': {
					DEFAULT: 'hsl(var(--running-accent))',
					foreground: 'hsl(var(--running-accent-foreground))',
					light: 'hsl(var(--running-accent-light))',
					dark: 'hsl(var(--running-accent-dark))'
				},
				'running-warning': {
					DEFAULT: 'hsl(var(--running-warning))',
					foreground: 'hsl(var(--running-warning-foreground))'
				},
				'running-neutral': {
					DEFAULT: 'hsl(var(--running-neutral))',
					light: 'hsl(var(--running-neutral-light))',
					dark: 'hsl(var(--running-neutral-dark))'
				},
				running: {
					primary: 'hsl(var(--running-primary))',
					secondary: 'hsl(var(--running-secondary))',
					accent: 'hsl(var(--running-accent))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(var(--running-primary) / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(var(--running-primary) / 0.6)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in': 'slideIn 0.5s ease-out',
				'fade-in': 'fadeIn 0.6s ease-out',
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'bounce-gentle': 'bounceGentle 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
