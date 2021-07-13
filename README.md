# Sudoku Studio

### Website
https://sudokustudio.github.io/SudokuStudio/

## About

This is a basic web UI for a sudoku solving/setting tool.

## Development

Ensure you have NodeJS and `npm@^7.0.0`.

If your `npm --version` is below 7.0.0 you can update it. You may need to use `sudo`:
```
npm i -g npm@^7.0.0
```

Clone the project, `cd` inside, then to install the dependencies run:
```
npm ci
```

For a live-reloading development server run:
```
npm run dev
```
This will reload on any changes in the Svelte packages: `packages/web` and `packages/board`.
If you change other packages you'll need to run e.g. `npm run -w packages/board-utils build`
to rebuild -- you can do this while the dev server is running.

If you are using VSCode (recommended):
* Install "Svelte for VS Code" extension.
* Click the gear and go to "Extension Settings" and turn on `svelte.enable-ts-plugin`.
* Restart VSCode.

Note that the plugin may highlight some SCSS imports:
```
Error: Can't find stylesheet to import.
  |
2 │     @use 'src/css/vars';
  |
```
However this is a false error since the plugin tries to resolve them relative to the git
repository root when they are actually relative to each package's `rollup.config.js`.
