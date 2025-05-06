# Sudoku Studio

### Website

https://sudokustudio.net (tracks `main` branch)

https://sudokustudio.github.io/SudokuStudio (tracks `dev` branch)

## About

This is a basic web UI for a sudoku solving/setting tool.

## Development

This project is set up as a multi-package workspace using the `pnpm` package manager. To install `pnpm`, run:

```
npm install -g pnpm
```

Clone the project and `cd` inside.

```
git clone https://github.com/SudokuStudio/SudokuStudio.git
cd SudokuStudio
```

To install the dependencies run:

```
pnpm i
```

For a live-reloading development server run:

```
pnpm run dev
```

This will live-reload on any changes in the workspace.

If you are using VSCode (recommended):

- Install "Svelte for VS Code" extension.
- Click the gear and go to "Extension Settings" and turn on `svelte.enable-ts-plugin`.
- Restart VSCode.

Note that the plugin may highlight some SCSS imports:

```
Error: Can't find stylesheet to import.
  |
2 │     @use 'src/css/vars';
  |
```

However this is a false error since the plugin tries to resolve them relative to the
repository root when they are actually relative to each package, see https://github.com/sveltejs/language-tools/issues/2751.

## License

Sudoku Studio
Copyright (C) 2021-2025 Sudoku Studio Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

# Sudoku-Assets
