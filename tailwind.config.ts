import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        turquesa: "#12D9EF",
        pink: "#891745",
        institucional: {
          turquesa: "#12D9EF",
          pink: "#891745",
          branco: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(137, 23, 69, 0.35)",
        soft: "0 4px 18px -10px rgba(137, 23, 69, 0.25)"
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        15: "0.15",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;

