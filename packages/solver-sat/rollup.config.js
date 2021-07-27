import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const bannerFix = 'self.document = self.document || {};';

export default {
    input: 'src/solver-sat.ts',
    output: {
        banner: bannerFix,
        sourcemap: true,
        format: 'es',
        dir: 'lib',
    },
    plugins: [
        copy({
            targets: [
                {
                    src: [
                        '../cryptominisat/lib/cryptominisat5_simple.wasm',
                        '../../node_modules/@sudoku-studio/pblib/dist/pblib.wasm',
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
