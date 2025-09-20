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
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
			},
			spacing: {
				'safe': 'env(safe-area-inset-bottom)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				'cyber-blue': 'hsl(var(--cyber-blue))',
				'cyber-purple': 'hsl(var(--cyber-purple))',
				'cyber-green': 'hsl(var(--cyber-green))',
				'cyber-red': 'hsl(var(--cyber-red))',
				'cyber-orange': 'hsl(var(--cyber-orange))',
				'cyber-pink': 'hsl(var(--cyber-pink))',
				'cyber-yellow': 'hsl(var(--cyber-yellow))',
				'cyber-teal': 'hsl(var(--cyber-teal))',
				'cyber-mint': 'hsl(var(--cyber-mint))',
				'cyber-violet': 'hsl(var(--cyber-violet))',
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-heartbeat': {
					'0%, 100%': { 
						transform: 'scale(1)',
						boxShadow: '0 0 20px hsl(var(--cyber-red) / 0.3)'
					},
					'50%': { 
						transform: 'scale(1.05)',
						boxShadow: '0 0 40px hsl(var(--cyber-red) / 0.6)'
					}
				},
				'scan-line': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'neon-glow': {
					'0%, 100%': { 
						textShadow: '0 0 10px currentColor, 0 0 20px currentColor' 
					},
					'50%': { 
						textShadow: '0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor' 
					}
				},
				'danger-pulse': {
					'0%, 100%': { backgroundColor: 'hsl(var(--background))' },
					'50%': { backgroundColor: 'hsl(var(--cyber-red) / 0.1)' }
				},
				'waveform': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: 'var(--glow-primary)',
						opacity: '1'
					},
					'50%': { 
						boxShadow: 'var(--glow-intense)',
						opacity: '0.8'
					}
				},
				'hologram': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'matrix-rain': {
					'0%': { transform: 'translateY(-100vh)' },
					'100%': { transform: 'translateY(100vh)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-in': {
					'0%': { 
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': { 
						transform: 'scale(1.05)',
						opacity: '0.8'
					},
					'70%': { 
						transform: 'scale(0.9)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': { 
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in-scale': {
					'0%': { 
						transform: 'scale(0.9)',
						opacity: '0'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-heartbeat': 'pulse-heartbeat 1s ease-in-out infinite',
				'scan-line': 'scan-line 2s linear infinite',
				'neon-glow': 'neon-glow 2s ease-in-out infinite',
				'danger-pulse': 'danger-pulse 1s ease-in-out infinite',
				'waveform': 'waveform 1.5s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'hologram': 'hologram 3s ease-in-out infinite',
				'matrix-rain': 'matrix-rain 3s linear infinite',
				'spin-slow': 'spin-slow 8s linear infinite',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'fade-in-scale': 'fade-in-scale 0.4s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
