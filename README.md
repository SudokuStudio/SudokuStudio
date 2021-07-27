# Sudoku Studio

### Website
https://sudokustudio.net

## About

This is a basic web UI for a sudoku solving/setting tool.

## Development

Ensure you have NodeJS and `npm@^7.0.0`.

If your `npm --version` is below 7.0.0 you can update it. You may need to use `sudo`:
```
npm i -g npm@^7.0.0
```

Clone the project with submodules, and `cd` inside.
```
git clone https://github.com/SudokuStudio/SudokuStudio.git
cd SudokuStudio
```

To install the dependencies run:
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

## License

Sudoku Studio
Copyright (C) 2021 Sudoku Studio Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
