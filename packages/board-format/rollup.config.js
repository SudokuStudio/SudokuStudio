import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

function makeConfig(output) {
    return {
        input: 'src/board-format.ts',
        output,
        plugins: [
            copy({
                targets: [
                    {
                        src: '../../node_modules/lzma/src/lzma_worker.js',
                        dest: 'src',
                    },
                    {
                        src: 'src/lzma_worker.LICENSE',
                        dest: output.dir,
                    },
                ],
            }),
            replace({
                preventAssignment: false,
                delimiters: ['', ''],
                values: {
                    'this.LZMA = this.LZMA_WORKER': 'module.exports',
                },
            }),
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json', outDir: output.dir }),
        ],
    };
}

export default [
    makeConfig({
        sourcemap: true,
        format: 'es',
        dir: 'lib',
    }),
    makeConfig({
        banner: "const { TextEncoder, TextDecoder } = require('util');",
        sourcemap: true,
        format: 'cjs',
        dir: 'dist',
    }),
];
