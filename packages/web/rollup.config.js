import path from 'path';

// We can't use rollup-plugin-typescript2 since it doesn't work well with svelte imports.
// We can't use rollup-plugin-web-worker-loader since it doesn't work with @rollup/plugin-typescript.
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';

import inlineSvg from './inlineSvg';


const NODE_MODULES = path.resolve('../../node_modules');
const production = !process.env.ROLLUP_WATCH;

const PATH_PUBLIC = path.resolve('public');
const PATH_OUTPUT = path.join(PATH_PUBLIC, 'build');

const FILE_WORKER_SATSOLVER = path.join(PATH_OUTPUT, 'satSolverWorker.js');

// Main bundle.
const configMain = {
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'bundle',
        file: path.join(PATH_OUTPUT, 'bundle.js'),
    },
    plugins: [
        replace({
            preventAssignment: true,
            values: {
                '__replace.SUDOKU_STUDIO_VERSION': JSON.stringify(process.env.SUDOKU_STUDIO_VERSION || 'DEV'),
                '__replace.WORKER_SATSOLVER_SCRIPT': JSON.stringify(path.relative(PATH_PUBLIC, FILE_WORKER_SATSOLVER)),
            },
        }),
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
            functions: {
                'inline-svg($filename)': inlineSvg
            },
            output: 'public/build/bundle.css',
            sourceMap: true,
            watch: 'src/css',
            includePaths: [ NODE_MODULES ],
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
        typescript(),

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
    },
};

const configSatSolverWorker = {
    input: 'src/js/solver/satSolverWorker.ts',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'satSolverWorker',
        file: FILE_WORKER_SATSOLVER,
    },
    plugins: [
        copy({
            targets: [
                {
                    src: [
                        '../solver-sat/lib/cryptominisat5_simple.wasm',
                        '../solver-sat/lib/pblib.wasm',
                    ],
                    dest: 'public/build',
                },
            ],
        }),
        replace({
            preventAssignment: true,
            values: {
                // Emscripten glue cleanup.
                ENVIRONMENT_IS_WEB: 'false',
                ENVIRONMENT_IS_WORKER: 'true',
                ENVIRONMENT_IS_NODE: 'false',
                ENVIRONMENT_IS_SHELL: 'false',
                'import.meta.url': 'self.location.href',
            },
        }),

        resolve({
            browser: true,
            extension: [ '.js', '.ts' ]
        }),
        commonjs(),
        typescript(),
    ],
};

const configs = [
    configSatSolverWorker,
    configMain,
];
export default configs;

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
