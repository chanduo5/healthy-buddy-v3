/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        glass: {
          white: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.12)',
          hover: 'rgba(255,255,255,0.14)',
          strong: 'rgba(255,255,255,0.18)',
        },
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        xp: {
          gold: '#f59e0b',
          blue: '#3b82f6',
          purple: '#8b5cf6',
        },
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 20% 20%, hsla(158,60%,30%,0.4) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(270,50%,25%,0.3) 0px, transparent 50%)',
        'mesh-2': 'radial-gradient(at 60% 10%, hsla(200,60%,25%,0.3) 0px, transparent 50%), radial-gradient(at 20% 80%, hsla(158,50%,20%,0.4) 0px, transparent 50%)',
        'card-glow': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        heavy: '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'xp-pop': 'xpPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        'streak-fire': 'streakFire 1s ease-in-out infinite alternate',
        'level-up': 'levelUp 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(74,222,128,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(74,222,128,0.5)' },
        },
        xpPop: {
          '0%': { opacity: 0, transform: 'scale(0.5) translateY(0)' },
          '60%': { opacity: 1, transform: 'scale(1.2) translateY(-20px)' },
          '100%': { opacity: 0, transform: 'scale(1) translateY(-40px)' },
        },
        streakFire: {
          from: { filter: 'hue-rotate(0deg) brightness(1)' },
          to: { filter: 'hue-rotate(20deg) brightness(1.2)' },
        },
        levelUp: {
          '0%': { opacity: 0, transform: 'scale(0.3) rotate(-10deg)' },
          '70%': { transform: 'scale(1.15) rotate(3deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        'glow-green': '0 0 30px rgba(74,222,128,0.3)',
        'glow-gold': '0 0 30px rgba(245,158,11,0.4)',
      },
    },
  },
  plugins: [],
}
