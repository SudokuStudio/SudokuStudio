import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

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
  onwarn: (warning, handler) => {
    // https://github.com/josdejong/svelte-jsoneditor/issues/387#issuecomment-2014948986
    if (warning.code === 'vite-plugin-svelte-preprocess-many-dependencies') return;
    // handle all other warnings normally
    handler(warning);
  },
};

export default config;
