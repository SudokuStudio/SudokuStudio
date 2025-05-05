import { boardRepr } from "@sudoku-studio/board-utils/src";
import { cantAttempt, solve, solveTrueCandidates } from "@sudoku-studio/solver-sat";

function hi(world: string): string {
    return `Hello ${world}`;
}

console.log(hi("WORLD"));
console.error("HELLO WORLD ERROR");
