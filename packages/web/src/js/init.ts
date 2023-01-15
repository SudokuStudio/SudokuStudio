import { debounce } from "debounce";
import LZString from "lz-string";
import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";
import { boardState } from "./board";
import { setupUserState } from "./user";
import { fPuzzles } from "@sudoku-studio/board-format";
import { createElement } from "./elements";

import { SatSolver } from "./solver/satSolver";
import { boardRepr, solutionToString } from "@sudoku-studio/board-utils";

// TODO SOMETHING PROPER
(window as any).solve = async function(maxSolutions = 10, maxTimeMillis = 10 * 1000): Promise<() => Promise<void>> {
    const START = Date.now();

    const board = boardState.get<schema.Board>()!;
    const canAttempt = await SatSolver.cantAttempt(board);
    if (canAttempt) {
        throw Error('Solver cannot attempt this puzzle: ' + canAttempt);
    }

    console.log(`SOLVING: maxSolutions=${maxSolutions} maxTimeMillis=${maxTimeMillis}`);

    let count = 0;
    let timeout: number = -1;
    const cancel = SatSolver.solve(board, maxSolutions, solution => {
        if (null == solution) {
            clearTimeout(timeout);
            console.log(`DONE. Found ${(count < maxSolutions) ? 'ALL ' : ''}${count} solutions in ${Date.now() - START} ms.`);
        }
        else {
            count++;
            console.log(`FOUND ${count} in ${Date.now() - START} ms:\n${solutionToString(solution, board.grid)}`);
        }
    });

    async function cancelLog(reason: string): Promise<void> {
        clearTimeout(timeout);
        if (await cancel()) {
            console.log(`${reason}. Found ${count} solutions in ${Date.now() - START} ms.`);
        }
    }

    if (isFinite(maxTimeMillis))
        timeout = window.setTimeout(cancelLog, maxTimeMillis, 'TIMED OUT');

    return () => cancelLog('CANCELLED');
}

export function initUserAndBoard(): void {
    boardState.watch(debounce((_path, _oldVal, newVal) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('b', LZString.compressToBase64(JSON.stringify(newVal)));
        window.history.replaceState(null, '', newUrl.href);
    }, 200), false, '.');

    const thisUrl = new URL(window.location.href);

    if (thisUrl.searchParams.has('f')) {
        try {
            const b64 = thisUrl.searchParams.get('f')!.replace(/ /g, '+');
            const newBoardState = fPuzzles.parseFpuzzles(b64, createElement);
            setupUserState(newBoardState);
            boardState.update(newBoardState as any);

            thisUrl.searchParams.delete('f');
            window.history.replaceState(null, '', thisUrl.href);

            return;
        }
        catch (e) {
            console.error('Failed to parse f-puzzles board', e);
            console.error(e);
        }
    }

    if (thisUrl.searchParams.has('c')) {
        const DIGIT_REGEX = /[1-9]/;
        const digitsString = thisUrl.searchParams.get('c')!;
        const size = 9;
        if (size * size === digitsString.length) {
            const digits = Array.from(digitsString).map(char => DIGIT_REGEX.test(char) ? +char : undefined);

            const newBoardState = boardRepr.createNewBoard(createElement);
            setupUserState(newBoardState);

            for (const element of Object.values(newBoardState.elements)) {
                if ('givens' === element.type) {
                    element.value = digits as unknown as IdxMap<Geometry.CELL, number>;
                }
            }
            boardState.update(newBoardState as any);

            thisUrl.searchParams.delete('c');
            window.history.replaceState(null, '', thisUrl.href);

            return;
        }
    }

    if (thisUrl.searchParams.has('b')) {
        const boardString = thisUrl.searchParams.get('b')!;
        try {
            const json = LZString.decompressFromBase64(boardString);
            if (null != json) {
                const newBoardState: schema.Board = JSON.parse(json);
                setupUserState(newBoardState);
                boardState.update(newBoardState as any);
                return;
            }
        }
        catch (e) {
            console.error('Failed to update board from `b` param.');
            console.error(e);
        }
    }

    const newBoardState = boardRepr.createNewBoard(createElement);
    setupUserState(newBoardState);
    boardState.update(newBoardState as any);
};
