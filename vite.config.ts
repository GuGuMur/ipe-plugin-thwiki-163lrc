import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import livePreview from 'vite-live-preview'
import UnoCSS from 'unocss/vite'
import Preact from '@preact/preset-vite'
import alias from '@rollup/plugin-alias';

const BASE_DIR = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    livePreview(),
    UnoCSS(),
    Preact(),
    alias({
			entries: [
				{ find: 'react', replacement: 'preact/compat' },
				{ find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
				{ find: 'react-dom', replacement: 'preact/compat' },
				{ find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
			]
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
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      input: "src/index.tsx",
      output: {
        entryFileNames: "main.js",
        format: "iife",
        name: "IPEPlugin",
        assetFileNames: "[name].[ext]",
      },
      external: ["mw", "$", "ssi_modal"],
    },
    minify: command === "build" ? "terser" : false,
    terserOptions: {
      mangle: {
        reserved: ["mw", "$", "ssi_modal"],
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
