import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const bannerFix = 'self.document = self.document || {};';

export default {
    input: 'src/solver-ilp.ts',
    output: [
        {
            banner: bannerFix,
            sourcemap: true,
            format: 'es',
            dir: 'lib',
        },
        {
            banner: bannerFix,
            sourcemap: true,
            format: 'iife',
            name: 'solverIlp',
            file: 'lib/solver-ilp.iife.js',
        }
    ],
    plugins: [
        copy({
            targets: [
                {
                    src: [
                        '../cryptominisat/lib/cryptominisat5_simple.wasm',
                        'external/pblib-wasm/dist/pblib.wasm',
                    ],
                    dest: 'lib',
                },
            ],
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
    ],
};
