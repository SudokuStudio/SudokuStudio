import * as LZString from "lz-string";
import { boardRepr, cellCoord2CellIdx, svgCoord2diagonalIdx, svgCoord2edgeIdx, roman2num, svgCoord2seriesIdx, cellIdx2cellCoord, svgCoord2cornerCoord, cornerCoord2cornerIdx } from "@sudoku-studio/board-utils";
import type { Coord, Geometry, Grid, Idx, IdxBitset, schema } from "@sudoku-studio/schema";
import { hexToHsluv, hsluvToHex } from "hsluv";

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
    killercage?: FPuzzlesCells[],
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
    // disabledlogic?: string[],
    // truecandidatesoptions?: string[],
};

type FPuzzlesGridEntry = {
    value?: number,
    given?: boolean,
    centerPencilMarks?: number[],
    cornerPencilMarks?: number[],
    givenPencilMarks?: number[],
    highlight?: string,
    c?: string,
    region?: number,
}

type FPuzzlesArrowEntry = {
    cells: string[],
    lines?: string[][],
};

type FPuzzlesLittleKillerSumEntry = {
    cell: string,
    direction: string,
    cells?: string[],
    value?: string,
};

type FPuzzlesCell = {
    cell: string,
    value?: string,
};

type FPuzzlesCells = {
    cells: string[],
    value?: string,
};

type FPuzzlesLines = {
    lines: string[][],
};

type FPuzzlesClone = {
    cells: string[],
    cloneCells: string[],
};

type FPuzzlesQuadruple = {
    cells: string[],
    values?: [ number?, number?, number?, number? ],
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


export function parseFpuzzles(b64: string, createElement: boardRepr.CreateElementFn): schema.Board {
    const json = LZString.decompressFromBase64(b64);
    if (null == json) throw Error('Failed to LZString decompress fpuzzles board.');
    const fBoard: FPuzzlesBoard = JSON.parse(json);

    const size = fBoard.size as undefined | keyof typeof fpuzzlesSizes;
    if (null == size || !(size in fpuzzlesSizes)) throw Error(`Unknown size: ${size})`);

    const board = boardRepr.createNewBoard(createElement, ...fpuzzlesSizes[size]);
    const grid: Grid = { width: size, height: size };


    function findOrAddElement<E extends schema.Element>(type: E['type'], value: E['value']): E {
        if (null == board.elements) board.elements  = {};
        for (const elem of Object.values(board.elements)) {
            if (type === elem.type) {
                Object.assign(elem.value, value);
                return elem as E;
            }
        }
        const elem = createElement<E>(type, value);
        board.elements[boardRepr.makeUid()] = elem;
        return elem;
    }
    function addRegionElement(type: schema.RegionElement['type'], fRegionConstraint: FPuzzlesCell[]): void {
        const elem: schema.RegionElement = findOrAddElement(type, {});
        for (const fRegionObj of fRegionConstraint) {
            const cellIdx = cellCoord2CellIdx(parseRCNotation(fRegionObj.cell), grid);
            elem.value![cellIdx] = true;
        }
    }
    function addLineElement(type: schema.LineElement['type'], fLinesConstraint: FPuzzlesLines[]): void {
        const elem: schema.LineElement = findOrAddElement(type, {});
        for (const fLinesObj of fLinesConstraint) {
            for (const fLine of fLinesObj.lines) {
                const cellArr: Idx<Geometry.CELL>[] = elem.value![boardRepr.makeUid()] = [];
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    cellArr.push(cellIdx);
                }
            }
        }
    }
    function addEdgeElement(
        type: schema.EdgeNumberElement['type'],
        fLinesConstraint: FPuzzlesCells[],
        parse: (val: string) => null |number = Number): void
    {
        const elem: schema.EdgeNumberElement = findOrAddElement(type, {});
        for (const fCellsObj of fLinesConstraint) {
            if (2 !== fCellsObj.cells.length) {
                console.error('Cannot parse difference not between two cells.');
                continue;
            }
            const coordA = parseRCNotation(fCellsObj.cells[0]);
            const coordB = parseRCNotation(fCellsObj.cells[1]);
            const average = [
                0.5 * (coordA[0] + coordB[0] + 1),
                0.5 * (coordA[1] + coordB[1] + 1),
            ] as [ number, number ];
            const edgeIdx = svgCoord2edgeIdx(average, grid);

            if (null == edgeIdx) {
                console.error(`Cannot parse difference between two nonadjacent cells: ${fCellsObj.cells.join(', ')}.`);
                continue;
            }

            const val = (null != fCellsObj.value) ? parse(fCellsObj.value) : null;
            elem.value![edgeIdx] = (null != val) ? val : true;
        }
    }
    function addSeriesElement(type: schema.SeriesNumberElement['type'], fConstraint: FPuzzlesCell[]):void {
        const elem: schema.SeriesNumberElement = findOrAddElement(type, {});
        for (const fCellValue of fConstraint) {
            // Find the equivalent click location.
            // Cell is outside the grid.
            const coord = parseRCNotation(fCellValue.cell) as [ number, number ];
            coord[0] += 0.5;
            coord[1] += 0.5;

            const seriesIdx = svgCoord2seriesIdx(coord, grid);
            if (null == seriesIdx) {
                console.error('Cannot handle this series.', fCellValue);
                continue;
            }
            elem.value![seriesIdx] = (null != fCellValue.value) ? Number(fCellValue.value) : true;
        }
    }
    function addKillerElement(fConstraint: FPuzzlesCells[]): void {
        const elem: schema.KillerElement = findOrAddElement('killer', {});
        for (const fKillerEntry of fConstraint) {
            const killerItem = elem.value![boardRepr.makeUid()] = {
                cells: {} as IdxBitset<Geometry.CELL>,
                sum: (null != fKillerEntry.value) ? Number(fKillerEntry.value) : undefined,
            };
            for (const rc of fKillerEntry.cells) {
                const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                killerItem.cells[cellIdx] = true;
            }
        }
    }

    if (fBoard.title) board.meta.title = fBoard.title;
    if (fBoard.author) board.meta.author = fBoard.author;
    if (fBoard.ruleset) board.meta.description = fBoard.ruleset;

    for (let y = 0; y < size; y++) {
        const gridRow = fBoard.grid[y];
        for (let x = 0; x < size; x++) {
            const gridEntry = gridRow[x];
            const cellIdx = cellCoord2CellIdx([ x, y ], grid);

            if (null != gridEntry.region) {
                // TODO
                console.error('Cannot handle f-puzzles regions.');
            }

            if (null != gridEntry.value) {
                let elem: schema.DigitElement;
                if (gridEntry.given) {
                    elem = findOrAddElement('givens', {});
                }
                else {
                    elem = findOrAddElement('filled', {});
                }
                elem.value![cellIdx] = gridEntry.value;
            }

            if (gridEntry.cornerPencilMarks) {
                const elem = findOrAddElement<schema.PencilMarksElement>('corner', {});
                const cellMarks = elem.value![cellIdx] = {} as Record<number, true>;
                gridEntry.cornerPencilMarks.forEach(x => cellMarks[x] = true);
            }
            if (gridEntry.centerPencilMarks) {
                const elem = findOrAddElement<schema.PencilMarksElement>('center', {});
                const cellMarks = elem.value![cellIdx] = {} as Record<number, true>;
                gridEntry.centerPencilMarks.forEach(x => cellMarks[x] = true);
            }
            if (gridEntry.highlight) {
                const elem = findOrAddElement<schema.ColorsElement>('colors', {});
                const cellMarks = elem.value![cellIdx] = {} as Record<string, true>;
                cellMarks[gridEntry.highlight] = true;
            }
        }
    }

    if (fBoard['diagonal+']) findOrAddElement('diagonal', { positive: true });
    if (fBoard['diagonal-']) findOrAddElement('diagonal', { negative: true });
    if (fBoard.antiknight) findOrAddElement('knight', true);
    if (fBoard.antiking) findOrAddElement('king', true);
    if (fBoard.disjointgroups) findOrAddElement('disjointGroups', true);
    if (fBoard.nonconsecutive) findOrAddElement('consecutive', { orth: true });

    if (fBoard.thermometer) addLineElement('thermo', fBoard.thermometer);
    if (fBoard.betweenline) addLineElement('between', fBoard.betweenline);
    if (fBoard.whispers) addLineElement('whisper', fBoard.whispers);
    if (fBoard.renban) addLineElement('renban', fBoard.renban);
    if (fBoard.palindrome) addLineElement('palindrome', fBoard.palindrome);

    if (fBoard.arrow) {
        const elem: schema.ArrowElement = findOrAddElement('arrow', {});
        for (const fArrowEntry of fBoard.arrow) {
            for (const fLine of fArrowEntry.lines || []) {
                const arrowItem = elem.value![boardRepr.makeUid()] = {
                    bulb: [] as Idx<Geometry.CELL>[],
                    body: [] as Idx<Geometry.CELL>[],
                };
                for (const rc of fArrowEntry.cells) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    arrowItem.bulb.push(cellIdx);
                }
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    arrowItem.body.push(cellIdx);
                }
            }
        }
    }

    if (fBoard.sandwichsum) addSeriesElement('sandwich', fBoard.sandwichsum);

    if (fBoard.killercage) addKillerElement(fBoard.killercage);
    if (fBoard.extraregion) {
        // TODO: this uses killer cages for now.
        console.warn('Extra region import uses killer cage.');
        addKillerElement(fBoard.extraregion);
    }

    if (fBoard.littlekillersum) {
        const elem: schema.LittleKillerElement = findOrAddElement('littleKiller', {});
        for (const fLkEntry of fBoard.littlekillersum) {
            // Find the equivalent click location.
            // Cell is outside the grid.
            const coord = parseRCNotation(fLkEntry.cell) as [ number, number ];
            if      ('DR' === fLkEntry.direction) { coord[0] += 0.75; coord[1] += 0.75 }
            else if ('DL' === fLkEntry.direction) { coord[0] += 0.25; coord[1] += 0.75 }
            else if ('UR' === fLkEntry.direction) { coord[0] += 0.75; coord[1] += 0.25 }
            else if ('UL' === fLkEntry.direction) { coord[0] += 0.25; coord[1] += 0.25 }

            const diagIdx = svgCoord2diagonalIdx(coord, grid);
            if (null == diagIdx) {
                console.error('Cannot handle this diagonal.', fLkEntry);
                continue;
            }
            elem.value![diagIdx] = (null != fLkEntry.value) ? Number(fLkEntry.value) : true;
        }
    }

    if (fBoard.difference) addEdgeElement('difference', fBoard.difference);
    if (fBoard.ratio) addEdgeElement('ratio', fBoard.ratio);
    if (fBoard.xv) addEdgeElement('xv', fBoard.xv, roman2num);

    if (fBoard.odd) addRegionElement('odd', fBoard.odd);
    if (fBoard.even) addRegionElement('even', fBoard.even);
    if (fBoard.minimum) addRegionElement('min', fBoard.minimum);
    if (fBoard.maximum) addRegionElement('max', fBoard.maximum);

    if (fBoard.quadruple) {
        const elem: schema.QuadrupleElement = findOrAddElement('quadruple', {});
        for (const fQuadEntry of fBoard.quadruple) {
            if (4 !== fQuadEntry.cells.length) {
                // Luckily, f-puzzles doesn't allow quadruples on edges.
                console.error('Cannot parse quadruple not between four cells.');
                continue;
            }
            const coord = fQuadEntry.cells
                .map(parseRCNotation)
                .reduce<[ number, number ]>(([ x0, y0 ], [ x1, y1 ]) => [ x0 + x1, y0 + y1 ], [ 0, 0 ]);
            coord[0] *= 0.25;
            coord[1] *= 0.25;

            const cornerCoord = svgCoord2cornerCoord(coord, grid);
            if (null == cornerCoord) {
                console.error('Cannot handle this quadruple.', fQuadEntry);
                continue;
            }

            const cornerIdx = cornerCoord2cornerIdx(cornerCoord, grid);
            elem.value![cornerIdx] = (null != fQuadEntry.values) ? fQuadEntry.values : true;
        }
    }

    if (fBoard.clone) {
        const elem: schema.CloneElement = findOrAddElement('clone', {});
        outer:
        for (const fCloneEntry of fBoard.clone) {
            const cloneItem = elem.value![boardRepr.makeUid()] = {
                color: undefined as undefined | string,
                a: fCloneEntry.cells     .map (rc => cellCoord2CellIdx(parseRCNotation(rc), grid)),
                b: fCloneEntry.cloneCells.map(rc => cellCoord2CellIdx(parseRCNotation(rc), grid)),
            };

            // Try to find color from cells.
            let color = null;
            for (const idx of cloneItem.a.concat(cloneItem.b)) {
                const [ x, y ] = cellIdx2cellCoord(idx, grid);
                const { c } = fBoard.grid[y][x];
                if (null == c) continue outer;
                if (!c.startsWith('#')) continue outer;

                if (null == color) color = c;
                else if (color !== c) continue outer;
            }
            if (null == color) continue;
            // All have same color.
            const [ h, s, l ] = hexToHsluv(color);
            cloneItem.color = hsluvToHex([ h, s, 0.5 * l ]);
        }
    }

    if (fBoard.negative) {
        // TODO
        console.error(`Cannot handle f-puzzles negative constraints: ${fBoard.negative.join(', ')}.`);
    }

    return board;
}
