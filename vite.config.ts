import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import livePreview from "vite-live-preview";
import UnoCSS from "unocss/vite";
import vue from "@vitejs/plugin-vue";
import alias from "@rollup/plugin-alias";
// import transformerCompileClass from "@unocss/transformer-compile-class";

const BASE_DIR = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  plugins: [
    livePreview(),
    UnoCSS(),
    // tailwindcss(),
    // Preact(),
    vue(),
    alias({
      entries: [],
    }),
    {
      name: "add-CSS",
      apply: "build",
      enforce: "post",
      generateBundle(_options, bundle) {
        let cssContent = "";
        Object.keys(bundle).forEach((fileName) => {
          const chunk = bundle[fileName];
          if (chunk.type === "asset" && fileName.endsWith(".css")) {
            cssContent += chunk.source;
            delete bundle[fileName];
          }
        });

        Object.keys(bundle).forEach((fileName) => {
          const chunk = bundle[fileName];
          if (chunk.type === "chunk" && chunk.isEntry) {
            chunk.code = chunk.code.trim();
            chunk.code += `!function(){mw.util.addCSS(\`${cssContent.trim()}\`);}();`;
          }
        });
      },
    },
  ],
  rules: {
    // "@unocss/enforce-class-compile": "warn",
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      input: "src/index.js",
      output: {
        entryFileNames: "main.js",
        format: "iife",
        name: "IPEPlugin",
        assetFileNames: "[name].[ext]",
      },
      external: ["mw", "$", "ssi_modal", "InPageEdit"],
    },
    minify: "terser",
    terserOptions: {
      mangle: {
        reserved: ["mw", "$", "ssi_modal", "InPageEdit"],
      },
      format: {
        comments: false,
      },
    },
    cssCodeSplit: false,
  },
  server: {
    host: "localhost",
    port: 3000,
    open: true,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: "localhost",
    port: 3000,
    open: "main.js",
    allowedHosts: true,
    cors: true,
  },
  resolve: {
    alias: {
      "/main.js": "/dist/main.js",
      "@": path.resolve(BASE_DIR, "./src"),
    },
  },
}));
