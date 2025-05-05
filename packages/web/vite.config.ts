import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inlineSvg } from './inlineSvg.js';

import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [
    // wasm(),
    // topLevelAwait(),
    sveltekit(),
  ],
  css: {
    preprocessorOptions: {
      // if using SCSS
      scss: {
        api: 'modern-compiler',
        functions: {
          'inline-svg($filename)': inlineSvg,
        },
      },
    },
  },
  resolve: {
    preserveSymlinks: false, // Important for monorepo setups
  },
  optimizeDeps: {
    exclude: [
      // Needed to ensure WASM is loaded correctly in the dev server:
      // https://github.com/vitejs/vite/issues/13314#issuecomment-1560745780
      '@sudoku-studio/cryptominisat',
      '@sudoku-studio/pblib',
    ]
  },
});
