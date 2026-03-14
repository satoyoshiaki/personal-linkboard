/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        card: "0 18px 40px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      animation: {
        rise: "rise 500ms ease-out both",
        glow: "glow 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
