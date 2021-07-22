import * as SolverIlp from "@sudoku-studio/solver-ilp";

self.addEventListener('message', e => {
    try {
        SolverIlp.findSudokuSolution();
    }
    catch (e) {
        console.error('SolverIlp ERROR', e);
    }
});
