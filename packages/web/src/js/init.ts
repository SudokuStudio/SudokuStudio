import { debounce } from "debounce";
import LZString from "lz-string";
import type { schema } from "@sudoku-studio/schema";
import { boardState } from "./board";
import { MARK_TYPES, userState } from "./user";
import { parseFpuzzles } from "./f-puzzles";
import { createNewBoard } from "./elements";

// TODO
import { IlpSolver } from "./solver/ilpSolver";
(window as any).IlpSolver = IlpSolver;
// TODO

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