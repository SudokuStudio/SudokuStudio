import { schema, ArrayObj, IdxBitset, Geometry } from "@sudoku-studio/schema";

export function makeUid(): string {
    return `${(31 * Math.floor(0xFFFFFFFF * Math.random()) + Date.now()) % 0xFFFFFFFF}`;
}

export type CreateElementFn = <E extends schema.Element>(type: E['type'], value?: E['value']) => E;

function defaultRegions(size: number = 9, boxWidth: number = 3, boxHeight: number = 3): ArrayObj<IdxBitset<Geometry.CELL>> {

    const regions: ArrayObj<IdxBitset<Geometry.CELL>> = {};
    for (let i = 0; i < size; i++) {
        regions[i] = {};
    }

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cellIdx = y * size + x;
            const by = Math.floor(y / boxHeight );
            const bx = Math.floor(x / boxWidth );
            regions[by * boxHeight + bx][cellIdx] = true;
        }
    }
    return regions;
}

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
    board.elements['2'] = createElement<schema.BoxElement>('box',
        defaultRegions(size, boxWidth, boxHeight)
    );
    board.elements['10'] = createElement<schema.DigitElement>('givens', {});
    board.elements['11'] = createElement<schema.DigitElement>('filled', {});
    board.elements['12'] = createElement<schema.PencilMarksElement>('corner', {});
    board.elements['13'] = createElement<schema.PencilMarksElement>('center', {});
    board.elements['14'] = createElement<schema.ColorsElement>('colors', {});

    return board;
}
