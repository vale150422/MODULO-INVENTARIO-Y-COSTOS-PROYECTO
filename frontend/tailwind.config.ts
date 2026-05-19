export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#0d1f14', 900: '#0f4c1e', 800: '#166534',
          700: '#15803d', 600: '#16a34a', 500: '#22c55e',
          400: '#4ade80', 100: '#bbf7d0',
        }
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], mono: ['DM Mono', 'monospace'] }
    }
  }
}