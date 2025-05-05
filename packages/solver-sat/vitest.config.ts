import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: false,
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
