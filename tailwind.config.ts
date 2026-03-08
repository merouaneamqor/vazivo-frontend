import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "media",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Primary = Zen Lavender (calm, balanced, wellness-focused)
        primary: {
          50: '#EDEAFF',
          100: '#EDEAFF',
          200: '#D5CEFF',
          300: '#BDB2FF',
          400: '#A596FF',
          500: '#816CFF',
          600: '#5A47CC',
          700: '#4838A3',
          800: '#362A7A',
          900: '#241C52',
          950: '#120E29',
          DEFAULT: '#816CFF',
        },
        // Secondary = Black system (typography, nav, premium contrast; 200 = faint borders, 400 = muted, 900 = pure black)
        black: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#0a0a0a',
          DEFAULT: '#0a0a0a',
        },
        // Accent - Aqua Serenity (fresh, calming, balanced)
        accent: {
          50: '#E2FAF6',
          100: '#E2FAF6',
          200: '#C5F5ED',
          300: '#A8F0E4',
          400: '#8BEBDB',
          500: '#4FD4C5',
          600: '#24A79A',
          700: '#1C8578',
          800: '#146356',
          900: '#0C4134',
          DEFAULT: '#4FD4C5',
        },
        // Neutral - modern SaaS grey (cards, dividers, inputs, layout)
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Success - soft green (base 500, hover 600, tint 50, badge 100 + text 700)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Warning - soft amber (hover 600, tint 50, badge 100 + text 800)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Error - gentle red (destructive buttons, form errors; hover 600, tint 50, badge 100 + text 700)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Info - calm blue (hover 600, tint 50, badge 100 + text 700)
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Surface - base (white), soft (neutral-50), hover (neutral-100); overlay for modals
        surface: {
          base: '#ffffff',
          soft: '#fafafa',
          hover: '#f4f4f5',
          page: '#fafafa',
          card: '#ffffff',
          sidebar: '#ffffff',
          overlay: 'rgb(0 0 0 / <alpha-value>)',
        },
        // Rose for beauty category
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // Lavender for spa/wellness
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Teal for barber/professional
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Zen palette for Ollazen redesign (updated with brand colors)
        zen: {
          lavender: '#816CFF',
          lavenderLight: '#EDEAFF',
          lavenderDark: '#5A47CC',
          aqua: '#4FD4C5',
          aquaLight: '#E2FAF6',
          aquaDark: '#24A79A',
          peach: '#FFE4E1',
          cream: '#FFF8F0',
          lilac: '#DDA0DD',
          mint: '#98FF98',
        },
        // Vazivo brand (official palette)
        vazivo: {
          red: '#9D0208',           // Primary brand / icon
          redLight: '#A81F24',      // Soft Red Tint – hover / accents
          charcoal: '#18181B',     // Logo text / headings
          white: '#FFFFFF',         // Background
          lightGray: '#E8E8E9',    // UI borders / cards
          // Aliases for existing usage (derived from official palette)
          orange: '#9D0208',
          orangeSoft: '#FEE2E2',
          rust: '#7F1D1D',
          cream: '#FFFFFF',
          creamDark: '#E8E8E9',
          warmGray: '#18181B',
          warmMuted: '#52525B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-logo)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 92, 124, 0.35)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.3)',
        'vazivo': '0 4px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'vazivo-hover': '0 8px 32px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 10s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-soft': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #ff5c7c 0%, #a855f7 100%)',
        'gradient-lavender-midnight': 'linear-gradient(135deg, #e9d5ff 0%, #ff5c7c 100%)',
        'gradient-deep-purple-ink': 'linear-gradient(180deg, #a855f7 0%, #ff5c7c 100%)',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff5c7c' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
