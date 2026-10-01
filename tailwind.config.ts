/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        amber: {
          glow: "#ffaa00",
          sunset: "#ff5e00",
          bright: "#ffb800",
        },
        surface: {
          DEFAULT: "#121216",
          elevated: "#1a1a22",
          border: "#282834",
        }
      },
      backgroundImage: {
        'glow-gradient': 'radial-gradient(circle at 50% 120%, rgba(255, 94, 0, 0.4) 0%, rgba(255, 170, 0, 0.2) 30%, transparent 70%)',
      }
    },
  },
  plugins: [],
};
