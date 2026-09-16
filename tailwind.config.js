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
          bg: "#000000",
          surface: "#0a0a0a",
          card: "#111111",
          border: "#222222",
          accent: "#ffffff",
          accentLight: "#f5f5f5",
          accentDark: "#cccccc",
          cyan: "#ffffff",
          cyanDark: "#cccccc",
          gold: "#999999",
          danger: "#ff4444",
          success: "#ffffff",
          muted: "#555555",
          light: "#cccccc",
          white: "#ffffff",
        },
      },
      borderRadius: { none: "0" },
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
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" },
          "50%": { filter: "drop-shadow(0 0 24px rgba(255,255,255,0.7))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;