import type { schema } from '@sudoku-studio/schema';
import * as LZString from 'lz-string';

export * as fPuzzles from './f-puzzles.js';

/// Will throw an error if the string is not a valid SudokuStudio board.
export function parseSudokuStudio(boardString: string): schema.Board {
    const json = LZString.decompressFromBase64(boardString);
    return JSON.parse(json);
}
