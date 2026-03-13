/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: {
          50:  "#f0fdf9",
          100: "#ccfbee",
          200: "#99f5dd",
          300: "#5eebc8",
          400: "#2dd9ae",
          500: "#0fbf95",
          600: "#079978",
          700: "#087b61",
          800: "#0a614f",
          900: "#0b5042",
        },
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        display: ["'Clash Display'", "'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        clay:    "8px 8px 0px 0px rgba(5,150,105,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
        "clay-lg": "12px 12px 0px 0px rgba(5,150,105,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        "clay-sm": "4px 4px 0px 0px rgba(5,150,105,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
        "glass":   "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      borderRadius: {
        clay: "20px",
        "clay-lg": "28px",
        "clay-xl": "36px",
      },
      animation: {
        "float":      "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-up":   "slideUp 0.4s ease-out",
        "fade-in":    "fadeIn 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        slideUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
