import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        c: {
          bg: "#081210",
          surface: "#0e1a17",
          card: "#14211d",
          border: "#1f332d",
          accent: "#2dd4bf",
          accentLight: "#5eead4",
          accentDark: "#0d9488",
          cyan: "#38bdf8",
          cyanDark: "#0ea5e9",
          gold: "#f0b429",
          danger: "#ef4444",
          success: "#34d399",
          muted: "#5f7a72",
          light: "#c8d8d3",
          white: "#eaf5f2",
        },
      },
      borderRadius: {
        none: "0",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        shine: "shine 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shine: {
          "0%, 100%": { filter: "drop-shadow(0 0 6px rgba(45,212,191,0.4))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(45,212,191,0.8))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;