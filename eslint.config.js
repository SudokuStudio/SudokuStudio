// @ts-check

import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import boardSvelteConfig from './packages/board/svelte.config.js';
import webSvelteConfig from './packages/web/svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
            ],
        },
    },
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
    prettier,
    ...svelte.configs.prettier,
    { languageOptions: { globals: { ...globals.browser, ...globals.node } }, rules: { 'no-undef': 'off' } },
    {
        files: ['packages/board/**/*.svelte', 'packages/board/**/*.svelte.ts', 'packages/board/**/*.svelte.js'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig: boardSvelteConfig,
            },
        },
    },
    {
        files: ['packages/web/**/*.svelte', 'packages/web/**/*.svelte.ts', 'packages/web/**/*.svelte.js'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig: webSvelteConfig,
            },
        },
    },
);
