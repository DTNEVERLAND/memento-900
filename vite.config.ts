import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// For the GitHub Pages demo the app is served from /memento-900/.
// The Tauri desktop build serves from the filesystem root, so base stays "/".
// Set BASE_PATH=/memento-900/ in the Pages build only.
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: { port: 5174 },
});
