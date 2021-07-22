import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/cryptominisat.ts',
    output: {
        sourcemap: true,
        format: 'es',
        dir: 'lib'
    },
    plugins: [
        copy({
            targets: [
                {
                    src: 'src/cryptominisat5_simple.wasm',
                    dest: 'lib/',
                },
            ],
        }),
        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte'],
            extension: [ '.js', '.ts' ]
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
    ],
};
