/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          cream: '#fbf7ee',
          warm: '#f4eee1',
          aged: '#ebdcc4',
        },
        ink: {
          navy: '#162c47',
          muted: '#476282',
          light: '#6c85a3',
        },
        snoopy: {
          blue: '#326296',
          pastel: '#bfd7ea',
          deep: '#0f1e33',
          sky: '#7ec8e3',
          accent: '#1e40af',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        handwriting: ['var(--font-caveat)', 'cursive'],
        typewriter: ['var(--font-courier-prime)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'book': '0 25px 60px -15px rgba(5, 12, 25, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.25)',
        'page': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'spine': 'inset 0 0 35px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}

