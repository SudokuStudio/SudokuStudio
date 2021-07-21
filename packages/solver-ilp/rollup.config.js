import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

export default {
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        format: 'es',
        name: 'solver-ilp',
        file: 'dist/solver-ilp.js',
    },
    plugins: [
        replace({
            preventAssignment: true,
            // https://linguinecode.com/post/how-to-add-environment-variables-to-your-svelte-js-app
            values: {
            },
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
    ],
};
