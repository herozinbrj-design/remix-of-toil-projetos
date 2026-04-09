import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
      "/uploads": { target: "http://localhost:3001", changeOrigin: true },
      "/robots.txt": { target: "http://localhost:3001", changeOrigin: true },
      "/sitemap.xml": { target: "http://localhost:3001", changeOrigin: true },
      "/llms.txt": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
