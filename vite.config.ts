import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  plugins: [],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        entryFileNames: 'main.js',
        format: 'iife',
        name: 'IPEPlugin'
      },
      external: ['mw', '$'],
    },
    minify: command === 'build' ? 'terser' : false, // 仅 build 时压缩
    terserOptions: {
      mangle: {
        reserved: ['mw', '$']
      }
    }
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '/main.js': '/dist/main.js',
    }
  }
}));