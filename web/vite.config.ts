import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "build",
    emptyOutDir: true,
    minify: "esbuild",
    cssMinify: "esbuild",
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
