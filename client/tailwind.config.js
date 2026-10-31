/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FE8505',
          orangeDark: '#d96e00',
          orangeLight: '#ff9c2b',
          offRed: '#E52E01',
          offRedDark: '#b82400',
          offRedLight: '#ff4d24',
          ivory: '#FFFDE1',
          ivoryMuted: '#e5e3cb',
          dark: '#080c14',
          panel: '#0e1526',
          panelLight: '#162038',
          border: '#3b1d11'
        },
        rail: {
          dark: '#080c14',
          panel: '#0e1526',
          panelLight: '#162038',
          border: '#3b1d11',
          orange: '#FE8505',
          offRed: '#E52E01',
          ivory: '#FFFDE1',
          cyan: '#FE8505',        // Themed to Orange
          cyanDark: '#E52E01',    // Themed to Off Red
          emerald: '#FE8505',
          emeraldLight: '#ff9c2b',
          amber: '#FE8505',
          rose: '#E52E01',
          textMuted: '#d6d3b8'    // Soft ivory muted
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
