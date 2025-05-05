import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from 'svelte-preprocess';
import * as path from "path";

const PATH_PUBLIC = path.resolve('public');
const PATH_OUTPUT = path.join(PATH_PUBLIC, 'build');

const FILE_WORKER_SATSOLVER = path.join(PATH_OUTPUT, 'satSolverWorker.js');

const replace = [
  ['__replace.SUDOKU_STUDIO_VERSION', JSON.stringify(process.env.SUDOKU_STUDIO_VERSION || 'DEV')],
  ['__replace.WORKER_SATSOLVER_SCRIPT', JSON.stringify(path.relative(PATH_PUBLIC, FILE_WORKER_SATSOLVER))],
];

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
    })
  },
};

export default config;
