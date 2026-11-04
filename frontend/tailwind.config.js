/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        card: "var(--color-card)",
        primary: "var(--color-text)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        "fake-red": "var(--color-fake-red)",
        "fake-red-light": "var(--color-fake-red-light)",
        "real-green": "var(--color-real-green)",
        "real-green-light": "var(--color-real-green-light)",
        "amber": "var(--color-amber)",
        "amber-light": "var(--color-amber-light)",
        border: "var(--color-border)",
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "22px",
        "card-sm": "14px",
      },
    },
  },
  plugins: [],
};

