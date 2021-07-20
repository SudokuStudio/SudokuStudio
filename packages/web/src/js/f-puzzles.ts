import LZString from "lz-string";
import { cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import type { Coord, Geometry, Grid, Idx, schema } from "@sudoku-studio/schema";
import { makeUid } from "./util";
import { createElement, createNewBoard } from "./elements";

type FPuzzlesBoard = {
    size: number,
    title?: string,
    author?: string,
    ruleset?: string,
    grid: FPuzzlesGridEntry[][],
    'diagonal+'?: boolean,
    'diagonal-'?: boolean,
    antiknight?: boolean,
    antiking?: boolean,
    disjointgroups?: boolean,
    nonconsecutive?: boolean,
    negative?: string[],
    arrow?: FPuzzlesArrowEntry[],
    killercage?: FPuzzlesKillerCageEntry[],
    littlekillersum?: FPuzzlesLittleKillerSumEntry[],
    odd?: FPuzzlesCell[],
    even?: FPuzzlesCell[],
    minimum?: FPuzzlesCell[],
    maximum?: FPuzzlesCell[],
    extraregion?: FPuzzlesCells[],
    thermometer?: FPuzzlesLines[],
    palindrome?: FPuzzlesLines[],
    renban?: FPuzzlesLines[],
    whispers?: FPuzzlesLines[],
    difference?: FPuzzlesCells[],
    xv?: FPuzzlesCells[],
    ratio?: FPuzzlesCells[],
    clone?: FPuzzlesClone[],
    quadruple?: FPuzzlesQuadruple[],
    betweenline?: FPuzzlesLines[],
    sandwichsum?: FPuzzlesCell[],
    disabledlogic?: string[],
    truecandidatesoptions?: string[],
};

type FPuzzlesGridEntry = {
    value?: number,
    given?: boolean,
    centerPencilMarks?: number[],
    cornerPencilMarks?: number[], // TODO CHECK IF THIS IS RIGHT.
    givenPencilMarks?: number[],
    region?: number,
}

type FPuzzlesArrowEntry = {
    cells: string[],
    lines?: string[][],
};

type FPuzzlesKillerCageEntry = {
    cells?: string[],
    value?: string,
};

type FPuzzlesLittleKillerSumEntry = {
    cell?: string,
    direction?: string,
    value?: string,
};

type FPuzzlesCell = {
    cell?: string,
    value?: string
};

type FPuzzlesCells = {
    cells?: string[],
    value?: string
};

type FPuzzlesLines = {
    lines: string[][]
};

type FPuzzlesClone = {
    cells?: string[],
    cloneCells?: string[]
};

type FPuzzlesQuadruple = {
    cells?: string[],
    values?: number[]
};



const fpuzzlesSizes = {
    3:  [  3, 1 ],
    4:  [  2, 2 ],
    5:  [  5, 1 ],
    6:  [  3, 2 ],
    7:  [  7, 1 ],
    8:  [  4, 2 ],
    9:  [  3, 3 ],
    10: [  5, 2 ],
    11: [ 11, 1 ],
    12: [  4, 3 ],
    13: [ 13, 1 ],
    14: [  7, 2 ],
    15: [  5, 3 ],
    16: [  4, 4 ],
} as const;

const RC_REGEX = /R(\d+)C(\d+)/i;
function parseRCNotation(rc: string): Coord<Geometry.CELL> {
    const match = RC_REGEX.exec(rc);
    if (null == match) throw Error(`Failed to parse RC string: ${rc}.`);
    const row = Number(match[1]);
    const col = Number(match[2]);
    const x = col - 1;
    const y = row - 1;
    return [ x, y ];
}


function findOrAddElement<E extends schema.Element>(board: schema.Board, type: E['type'], value: E['value']): E {
    if (null == board.elements) board.elements  = {};
    for (const elem of Object.values(board.elements)) {
        if (type === elem.type)
            return elem as E;
    }
    const elem = createElement<E>(type, value);
    board.elements[makeUid()] = elem;
    return elem;
}


export function parseFpuzzles(b64: string): schema.Board {
    (window as any).LZString = LZString;
    console.log(b64);
    const json = LZString.decompressFromBase64(b64);
    if (null == json) throw Error('Failed to LZString decompress fpuzzles board.');
    const fBoard: FPuzzlesBoard = JSON.parse(json);

    const size = fBoard.size as undefined | keyof typeof fpuzzlesSizes;
    if (null == size || !(size in fpuzzlesSizes)) throw Error(`Unknown size: ${size})`);

    const board = createNewBoard(...fpuzzlesSizes[size]);
    const grid: Grid = { width: size, height: size };

    if (fBoard.title) board.meta.title = fBoard.title;
    if (fBoard.author) board.meta.author = fBoard.author;
    if (fBoard.ruleset) board.meta.description = fBoard.ruleset;

    for (let y = 0; y < size; y++) {
        const gridRow = fBoard.grid[y];
        for (let x = 0; x < size; x++) {
            const gridEntry = gridRow[x];

            const cellIdx = cellCoord2CellIdx([ x, y ], grid);

            if (null != gridEntry.value) {
                let elem: schema.DigitElement;
                if (gridEntry.given) {
                    elem = findOrAddElement(board, 'givens', {});
                }
                else {
                    elem = findOrAddElement(board, 'filled', {});
                }
                console.log(elem);
                elem.value[cellIdx] = gridEntry.value;
            }
        }
    }

    if (fBoard.antiking) {
        findOrAddElement(board, 'king', true);
    }

    if (fBoard.thermometer) {
        const elem: schema.LineElement = findOrAddElement(board, 'thermo', {});
        for (const fLinesObj of fBoard.thermometer) {
            const thermoArr: Idx<Geometry.CELL>[] = elem.value[makeUid()] = [];
            for (const fLine of fLinesObj.lines) {
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    thermoArr.push(cellIdx);
                }
            }
        }
    }

    if (fBoard.arrow) {
        const elem: schema.ArrowElement = findOrAddElement(board, 'arrow', {});
        for (const fArrowEntry of fBoard.arrow) {
            const arrowItem = elem.value[makeUid()] = {
                bulb: [] as Idx<Geometry.CELL>[],
                body: [] as Idx<Geometry.CELL>[],
            };
            for (const rc of fArrowEntry.cells) {
                const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                arrowItem.bulb.push(cellIdx);
            }
            for (const fLine of fArrowEntry.lines || []) {
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    arrowItem.body.push(cellIdx);
                }
            }
        }
    }

    return board;
}
