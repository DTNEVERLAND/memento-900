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
        // Editorial serif for display headings. Playfair covers Latin;
        // CJK falls back to the system serif so 中文标题也有书卷气。
        display: [
          "Playfair Display", "Georgia", "Songti SC", "STSong", "SimSun", "serif",
        ],
      },
      borderRadius: {
        card: "28px",
        hero: "36px",
      },
      boxShadow: {
        // Soft, wide "premium" shadow for elevated dark cards
        premium: "0 10px 30px -5px rgba(0, 0, 0, 0.55)",
        // Subtle gold halo for the accent elements
        halo: "0 0 24px rgba(201, 178, 125, 0.18)",
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
