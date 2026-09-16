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
          bg: "#080a0f",
          surface: "#0f1218",
          card: "#141820",
          border: "#1e2530",
          accent: "#ff5722",
          accentLight: "#ff7043",
          accentDark: "#e64a19",
          teal: "#00e5a0",
          tealDark: "#00c98b",
          gold: "#ffb300",
          muted: "#5a6577",
          light: "#d1d5dc",
          white: "#f0f2f5",
          danger: "#ef4444",
          success: "#22c55e",
        },
      },
      borderRadius: {
        none: "0",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255,87,34,0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(255,87,34,0.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;