import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inlineSvg } from './inlineSvg.js';
import * as sass from "sass";

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      // if using SCSS
      scss: {
        api: 'modern-compiler',
        functions: {
          // 'inline-svg($filename)': inlineSvg,
          'powpow($base, $exponent)': function(args: sass.Value[]) {
            console.log(args.toString());
            console.log(typeof args[0]);
            console.log('a', Object.getPrototypeOf(args[0]));
            console.log('a', Object.getPrototypeOf(args[0]).toString());
            console.log('a', args[0] instanceof sass.Value);

            const base = args[0].assertNumber('base').assertNoUnits('base');
            const exponent =
              args[1].assertNumber('exponent').assertNoUnits('exponent');

            const out = new sass.SassNumber(Math.pow(base.value, exponent.value));
            console.log('b', typeof out);
            console.log('b', Object.getPrototypeOf(out));
            console.log('b', out instanceof sass.Value);
            return args[0];

            // return new sass.SassNumber(Math.pow(base.value, exponent.value));
          }
        },
      },
    },
  }
});
