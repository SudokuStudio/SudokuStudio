import path from 'path';

import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
// import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import pkg from './package.json';


const NODE_MODULES = path.resolve('../../node_modules');
const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}



export default {
    input: 'src/main.ts',
    output: [
        {
            file: pkg.module,
            'format': 'es',
            sourcemap: true,
        },
        {
            format: 'cjs',
            name: 'sudoku_studio_board',
            file: 'public/build/board.js',
            sourcemap: true,
        }
    ],
    plugins: [
        svelte({
            preprocess: sveltePreprocess({
                scss: {
                    includePaths: [ NODE_MODULES ],
                },
                sourceMap: true //!production
            }),
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production,
            },
        }),
        scss({
            includePaths: [ NODE_MODULES ],
        }),
        // // we'll extract any component CSS out into
        // // a separate file - better for performance
        // css({ output: 'bundle.css' }),

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
        typescript({
            sourceMap: true, //!production,
            inlineSources: true, //!production
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};
