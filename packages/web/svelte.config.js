import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import * as path from "path";

const PATH_PUBLIC = path.resolve('public');
const PATH_OUTPUT = path.join(PATH_PUBLIC, 'build');

const FILE_WORKER_SATSOLVER = path.join(PATH_OUTPUT, 'satSolverWorker.js');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: "build",
      assets: "build",
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    env: {
      publicPrefix: 'SUDOKU_STUDIO_',
    }
  },
};

export default config;
