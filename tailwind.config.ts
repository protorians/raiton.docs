import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#eef1f8",
          soft: "#c8cfdd",
          muted: "#98a1b4",
          faint: "#828aa0",
        },
        night: {
          DEFAULT: "#05070d",
          raised: "#0a0e1a",
          sunken: "#03050a",
        },
        ice: {
          DEFAULT: "#a9c4ff",
          hi: "#c3d6ff",
          deep: "#3f7bff",
        },
        violet: "#7b4dff",
        teal: "#4fd6c9",
        mint: "#7de8a8",
        rose: "#ff6b81",
        peach: "#f8c99b",
        cream: {
          DEFAULT: "#fbf3dc",
          deep: "#f6e7c4",
        },
        coral: {
          DEFAULT: "#ff6b81",
          strong: "#e14d66",
          soft: "#ff9fb0",
        },
        canvas: {
          DEFAULT: "#f5f7fc",
          raised: "#ffffff",
          sunken: "#eef2fb",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glass:
          "inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(255,255,255,.03), 0 18px 40px -18px rgba(0,0,0,.7)",
        window:
          "0 0 0 1px rgba(255,255,255,.12), 0 40px 90px -30px rgba(0,0,0,.85)",
        glow: "0 0 0 1px rgba(169,196,255,.18), 0 30px 90px -30px rgba(63,123,255,.55)",
        card: "inset 0 1px 0 rgba(255,255,255,.08), 0 20px 50px -30px rgba(0,0,0,.8)",
        lift: "0 24px 60px -30px rgba(0,0,0,.9)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      maxWidth: {
        wrap: "80rem",
        prose: "52rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: ".35" },
          "50%": { opacity: "1" },
        },
        aurora: {
          "0%, 100%": { transform: "translate3d(-2%, -1%, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, 1.5%, 0) scale(1.06)" },
        },
        drift: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        trace: {
          from: { offsetDistance: "0%" },
          to: { offsetDistance: "100%" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.16,1,.3,1) both",
        "soft-pulse": "soft-pulse 3.2s ease-in-out infinite",
        aurora: "aurora 22s ease-in-out infinite",
        drift: "drift 70s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
