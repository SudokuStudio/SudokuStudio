import { debounce } from "debounce";
import LZString from "lz-string";
import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";
import { boardState } from "./board";
import { MARK_TYPES, userState } from "./user";
import { parseFpuzzles } from "./f-puzzles";
import { createNewBoard } from "./elements";

import { IlpSolver } from "./solver/satSolver";
import { solutionToString } from "@sudoku-studio/board-utils";

// TODO SOMETHING PROPER
(window as any).solve = async function(maxSolutions = 10, maxTime = 10 * 1000): Promise<() => void> {
    const START = Date.now();

    const board = boardState.get<schema.Board>()!;
    const canAttempt = await IlpSolver.cantAttempt(board);
    if (canAttempt) {
        throw Error('Solver cannot attempt this puzzle: ' + canAttempt);
    }

    console.log(`SOLVING: maxSolutions=${maxSolutions} maxTime=${maxTime}`);

    let count = 0;
    let timeout: number;
    const cancel = IlpSolver.solve(board, maxSolutions, solution => {
        if (null == solution) {
            clearTimeout(timeout);
            console.log(`DONE. Found ${(count < maxSolutions) ? 'ALL ' : ''}${count} solutions in ${Date.now() - START} ms.`);
        }
        else {
            count++;
            console.log(`FOUND ${count}:\n${solutionToString(solution, board.grid)}`);
        }
    });

    timeout = window.setTimeout(() => {
        cancel();
        console.log(`TIMED OUT. Found ${count} solutions in ${Date.now() - START} ms.`);
    }, maxTime);

    return cancel;
}

/** Load tools and pencil marks for the user. */
function setupUserState(board: schema.Board) {
    for (const [ id, { type }] of Object.entries(board.elements)) {
        if ((MARK_TYPES as readonly string[]).includes(type)) {
            userState.ref('marks', type).replace(id);
            if ('filled' === type) {
                userState.ref('tool').replace(id);
                userState.ref('prevTool').replace(id);
            }
        }
    }
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
            const newBoardState = parseFpuzzles(b64);
            setupUserState(newBoardState);
            boardState.update(newBoardState as any);

            thisUrl.searchParams.delete('f');
            window.history.replaceState(null, '', thisUrl.href);

            return;
        }
        catch (e) {
            console.error('Failed to parse f-puzzles board', e);
        }
    }

    if (thisUrl.searchParams.has('c')) {
        const DIGIT_REGEX = /[1-9]/;
        const digitsString = thisUrl.searchParams.get('c')!;
        if (81 === digitsString.length) {
            const digits = Array.from(digitsString).map(char => DIGIT_REGEX.test(char) ? +char : undefined);

            const newBoardState = createNewBoard();
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
                const newBoardState = JSON.parse(json);
                setupUserState(newBoardState);
                boardState.update(newBoardState);
                return;
            }
        }
        catch (e) {
            console.error('Failed to update board from `b` param.');
        }
    }
    const newBoardState = createNewBoard();
    setupUserState(newBoardState);
    boardState.update(newBoardState as any);
};