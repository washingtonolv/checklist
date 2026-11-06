import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Every value comes from src/app/theme.css (supports opacity modifiers).
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        pink: "rgb(var(--color-brand) / <alpha-value>)",
        turquesa: "rgb(var(--color-accent) / <alpha-value>)",
        ink: "rgb(var(--color-text) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        canvas: "rgb(var(--color-background) / <alpha-value>)",
        line: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        institucional: {
          turquesa: "rgb(var(--color-accent) / <alpha-value>)",
          pink: "rgb(var(--color-brand) / <alpha-value>)",
          branco: "rgb(var(--color-surface) / <alpha-value>)"
        }
      },
      fontFamily: { sans: ["var(--font-body)"] },
      borderRadius: {
        lg: "var(--radius-control)",
        xl: "var(--radius-card)",
        "2xl": "var(--radius-card)"
      },
      boxShadow: { card: "var(--shadow-card)", soft: "var(--shadow-control)" },
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

