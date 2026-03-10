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
        // Primary = Vazivo red (brand)
        primary: {
          50: '#FEE2E2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#9D0208',
          600: '#A81F24',
          700: '#7F1D1D',
          800: '#7F1D1D',
          900: '#450A0A',
          950: '#450A0A',
          DEFAULT: '#9D0208',
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
        // Accent = Vazivo red tints (secondary accents, highlights)
        accent: {
          50: '#FEE2E2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#9D0208',
          600: '#A81F24',
          700: '#7F1D1D',
          800: '#7F1D1D',
          900: '#450A0A',
          DEFAULT: '#9D0208',
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
        // Lavender (vazivo red tints – was spa/wellness, now brand-aligned)
        lavender: {
          50: '#FEE2E2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#9D0208',
          600: '#A81F24',
          700: '#7F1D1D',
          800: '#7F1D1D',
          900: '#450A0A',
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
        // Zen palette (vazivo-aligned)
        zen: {
          lavender: '#9D0208',
          lavenderLight: '#FEE2E2',
          lavenderDark: '#7F1D1D',
          aqua: '#9D0208',
          aquaLight: '#FEE2E2',
          aquaDark: '#A81F24',
          peach: '#FFE4E1',
          cream: '#FFF8F0',
          lilac: '#9D0208',
          mint: '#FEE2E2',
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
        'glow': '0 0 20px rgba(157, 2, 8, 0.35)',
        'glow-accent': '0 0 20px rgba(168, 31, 36, 0.3)',
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
        'gradient-primary': 'linear-gradient(135deg, #9D0208 0%, #A81F24 100%)',
        'gradient-lavender-midnight': 'linear-gradient(135deg, #FECACA 0%, #9D0208 100%)',
        'gradient-deep-purple-ink': 'linear-gradient(180deg, #9D0208 0%, #7F1D1D 100%)',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239D0208' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
