import { debounce } from "debounce";
import LZString from "lz-string";
import type { schema } from "@sudoku-studio/schema";
import { boardState } from "./board";
import { createElement, ELEMENT_HANDLERS } from "./elements";
import { MARK_TYPES, userState } from "./user";

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

function createNewBoard(boxWidth: number = 3, boxHeight: number = 3): schema.Board {
    const size = boxWidth * boxHeight;

    const board: schema.Board = {
        grid: {
            width: size,
            height: size,
        },
        meta: {
            title: null,
            author: null,
            description: null,
        },
        elements: {}
    };

    board.elements['1'] = createElement<schema.GridElement>('grid');
    board.elements['2'] = createElement<schema.BoxElement>('box', {
        width: boxWidth,
        height: boxHeight,
    });
    board.elements['10'] = createElement<schema.DigitElement>('givens');
    board.elements['11'] = createElement<schema.DigitElement>('filled');
    board.elements['12'] = createElement<schema.PencilMarksElement>('corner');
    board.elements['13'] = createElement<schema.PencilMarksElement>('center');
    board.elements['14'] = createElement<schema.ColorsElement>('colors');

    return board;
}

export function initUserAndBoard(): void {
    boardState.watch(debounce((_path, _oldVal, newVal) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('b', LZString.compressToEncodedURIComponent(JSON.stringify(newVal)));
        window.history.replaceState(null, '', newUrl.href);
    }, 200), false, '.');

    const thisUrl = new URL(window.location.href);
    if (thisUrl.searchParams.has('b')) {
        const boardString = thisUrl.searchParams.get('b')!;
        try {
            const json = LZString.decompressFromEncodedURIComponent(boardString);
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