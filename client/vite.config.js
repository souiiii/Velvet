import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  build: { minify: true, cssMinify: true },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
    host: true,
  },
});
