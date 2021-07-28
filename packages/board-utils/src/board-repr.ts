import { schema } from "@sudoku-studio/schema";

export function makeUid(): string {
    return `${(31 * Math.floor(0xFFFFFFFF * Math.random()) + Date.now()) % 0xFFFFFFFF}`;
}

export type CreateElementFn = <E extends schema.Element>(type: E['type'], value?: E['value']) => E;

export function createNewBoard(createElement: CreateElementFn, boxWidth: number = 3, boxHeight: number = 3): schema.Board {
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
    board.elements['10'] = createElement<schema.DigitElement>('givens', {});
    board.elements['11'] = createElement<schema.DigitElement>('filled', {});
    board.elements['12'] = createElement<schema.PencilMarksElement>('corner', {});
    board.elements['13'] = createElement<schema.PencilMarksElement>('center', {});
    board.elements['14'] = createElement<schema.ColorsElement>('colors', {});

    return board;
}
