import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Zwei Farbwelten, weil der Betrieb zwei Geschaefte hat.
        // Die Seite schaltet zwischen ihnen um - das erklaert das
        // Geschaeftsmodell schneller als jeder Absatz Text.
        moss: {
          50: '#f2f7ef', 100: '#e2eeda', 200: '#c4ddb7', 300: '#9bc588',
          400: '#71a75c', 500: '#528a3d', 600: '#3e6d2e', 700: '#325726',
          800: '#2a4622', 900: '#233b1e', 950: '#0f200d',
        },
        frost: {
          50: '#f0f7fb', 100: '#dcecf5', 200: '#c0dded', 300: '#94c7e0',
          400: '#61a9cd', 500: '#3e8cb8', 600: '#2e719c', 700: '#275b7f',
          800: '#254e6a', 900: '#234259', 950: '#0d1b25',
        },
        bark: {
          50: '#f7f6f4', 100: '#e9e6e0', 200: '#d4cec3', 300: '#b8ae9d',
          400: '#9c8f7a', 500: '#877860', 600: '#736450', 700: '#5e5143',
          800: '#4f453b', 900: '#443c34', 950: '#17130f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        drift: {
          '0%': { transform: 'translateY(-8%) translateX(0)' },
          '100%': { transform: 'translateY(108%) translateX(28px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.22,.9,.3,1) both',
      },
    },
  },
  plugins: [],
};
export default config;
