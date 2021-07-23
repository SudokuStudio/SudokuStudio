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
        typescript({ tsconfig: './tsconfig.json' }),
    ],
};
