import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inlineSvg } from './inlineSvg.js';
import * as sass from "sass-embedded";
// import * as sass from "sass";

export default defineConfig({
  plugins: [sveltekit()],
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
});
