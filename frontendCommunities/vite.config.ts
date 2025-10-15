import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// lovable-tagger removed for licensing/privacy reasons; plugin usage was cleared

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Load .env from the repo root as well, so variables in IBM-Z-Datathon/.env are available
  envDir: path.resolve(__dirname, ".."),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
