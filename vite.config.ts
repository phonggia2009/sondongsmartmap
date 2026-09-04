import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
          router: ["react-router"],
          motion: ["framer-motion"],
          query: ["@tanstack/react-query"],
          gis: ["leaflet", "react-leaflet", "supercluster", "use-supercluster"],
        },
      },
    },
  },
});