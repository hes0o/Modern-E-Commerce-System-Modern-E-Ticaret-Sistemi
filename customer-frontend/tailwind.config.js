/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF7",
        ink: "#17181A",
        "ink-soft": "#5B5E63",
        "ink-faint": "#9A9D9F",
        line: "#E4E1D8",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#0F6656",
          hover: "#0B4F43",
          soft: "#E7F1EE",
        },
        accent: {
          DEFAULT: "#E8562F",
          soft: "#FCE9E2",
        },
        danger: "#C6362A",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,24,26,0.05), 0 1px 0 rgba(23,24,26,0.04)",
        pop: "0 8px 24px rgba(23,24,26,0.10)",
      },
    },
  },
  plugins: [],
}
