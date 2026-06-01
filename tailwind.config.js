/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Memento 900 design tokens — monochrome dark + restrained gold
        bg: "#08090a",
        panel: "#0e1012",
        surface: "#101214",
        fg: "#e9e9e7",
        muted: "#6b6f72",
        faint: "#16181a",
        spent: "#2c2f33",
        "spent-edge": "#3a3e43",
        now: "#f4f4f2",
        accent: "#c9b27d",
        line: "#26292c",
        mood: {
          joy: "#d8b24a",
          calm: "#5a8fa3",
          love: "#b06a86",
          growth: "#6f9e6a",
          hard: "#8a6a9e",
          grief: "#7a7d82",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto",
          "PingFang SC", "Microsoft YaHei", "sans-serif",
        ],
      },
      keyframes: {
        pulse900: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        pulse900: "pulse900 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
