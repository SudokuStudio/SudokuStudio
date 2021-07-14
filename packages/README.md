# Packages

This folder contains the separate JavaScript packages that make up this project.

## `web`

This contains the code for the web interface _except_ for the Sudoku board.
This uses the [Svelte](https://svelte.dev/) framework.

## `board`

This contains the code for rendering the Sudoku board, uses [Svelte](https://svelte.dev/).

## `board-utils`

Contains TypeScript utility functions for dealing with board coordinates, paths, etc.

## `board-svg`

A very simple runnable NodeJS program which uses `board` to generate SVG source code from a
board state.

## `schema`

Contains some TypeScript type declarations (no actual code) for the board state representation.

## `state-manager`

This implements simple but powerful state-management interface, allowing code to watch
for state updates. This is used by other packages to store the board state and dynamically
update the display when that state changes.
