import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function devBackendProxy(): ProxyOptions {
  return {
    target: "http://localhost:4000",
    changeOrigin: true,
    configure(proxy) {
      proxy.on("error", (err) => {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === "ECONNREFUSED" || code === "ECONNRESET") {
          console.warn(
            `[vite] ${code ?? "proxy"}: không kết nối được http://localhost:4000 — chạy API (cd backend && npm run dev) và kiểm tra MySQL / DATABASE_URL.`
          );
        } else {
          console.warn("[vite] proxy:", (err as Error).message);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": devBackendProxy(),
      "/health": devBackendProxy(),
      "/openapi.json": devBackendProxy(),
      "/api-docs": devBackendProxy(),
    },
  },
  build: {
    minify: mode === "development" ? false : "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
        entryFileNames: mode === "development" ? "assets/[name].js" : "assets/[name]-[hash].js",
        chunkFileNames: mode === "development" ? "assets/[name].js" : "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return mode === "development"
              ? `assets/images/[name].${extType}`
              : `assets/images/[name]-[hash].${extType}`;
          }
          if (/css/i.test(extType)) {
            return mode === "development"
              ? `assets/css/[name].css`
              : `assets/css/[name]-[hash].${extType}`;
          }
          return mode === "development"
            ? `assets/[name].${extType}`
            : `assets/[name]-[hash].${extType}`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
