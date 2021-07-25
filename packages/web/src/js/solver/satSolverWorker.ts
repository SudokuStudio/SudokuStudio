import * as Comlink from "comlink";
import type { CancellationToken } from "@sudoku-studio/solver-sat";
import { cantAttempt, solve } from "@sudoku-studio/solver-sat";
import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";
import { makeUid } from "../util";

const CANCELLATION_TABLE: Record<string, CancellationToken> = {};

function solveAsync(board: schema.Board, maxSolutions: number,
    onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): string
{
    const taskId = makeUid();
    const token: CancellationToken = {};
    CANCELLATION_TABLE[taskId] = token;

    console.log(`[${taskId}] Starting.`);

    solve(board, maxSolutions, onSolutionFoundOrComplete, token)
        .finally(() => {
            delete CANCELLATION_TABLE[taskId];
            console.log(`[${taskId}] Finished.`);
        });

    return taskId;
}

function cancel(taskId: string): boolean {
    if (taskId in CANCELLATION_TABLE) {
        console.log(`Cancelling ${taskId}.`);
        CANCELLATION_TABLE[taskId].cancelled = true;
        delete CANCELLATION_TABLE[taskId];
        return true;
    }
    return false;
}

const DEFAULT = {
    cantAttempt,
    solveAsync,
    cancel,
} as const;

export default DEFAULT;

Comlink.expose(DEFAULT);
