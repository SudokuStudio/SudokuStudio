import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";

export type Cancel = {
    (): void;
};

export interface Solver {
    canAttempt(board: schema.Board): boolean;
    solve(board: schema.Board, maxSolutions: number, timeDue: number, onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): Cancel;
}
