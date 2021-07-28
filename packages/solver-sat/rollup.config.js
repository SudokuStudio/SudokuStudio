import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

const bannerFix = 'self.document = self.document || {};';

const configs = [];

configs.push({
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
                        '../../node_modules/@sudoku-studio/cryptominisat/dist/cryptominisat5_simple.wasm',
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
});

configs.push({
    input: 'src/solver-sat.ts',
    output: {
        banner: bannerFix,
        sourcemap: true,
        format: 'cjs',
        dir: 'dist',
    },
    plugins: [
        copy({
            targets: [
                {
                    src: [
                        '../../node_modules/@sudoku-studio/cryptominisat/dist/cryptominisat5_simple.wasm',
                        '../../node_modules/@sudoku-studio/pblib/dist/pblib.wasm',
                    ],
                    dest: 'dist',
                },
            ],
        }),
        replace({
            preventAssignment: true,
            delimiters: ['', ''],
            values: {
                // Emscripten glue cleanup.
                ENVIRONMENT_IS_WEB: 'false',
                ENVIRONMENT_IS_WORKER: 'false',
                ENVIRONMENT_IS_NODE: 'true',
                ENVIRONMENT_IS_SHELL: 'false',
                "Module['locateFile']": "(function(s){return __dirname+'/'+s})",
            },
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json', outDir: 'dist' }),
    ],
});

export default configs;
