import type { Coord, Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import { cellCoord2CellIdx, getMajorDiagonal, getOrthogonallyAdjacentPairs, kingMoves, knightMoves, product, writeRepeatingDigits } from "../../../../board-utils/lib/board-utils";
import type { ElementInfo } from "./element";

export const diagonalInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Diagonals',
        checkbox: [
            {
                name: 'Positive Diagonal',
                icon: 'positive-diagonal',
                refPath: 'positive',
            },
            {
                name: 'Negative Diagonal',
                icon: 'negative-diagonal',
                refPath: 'negative',
            },
        ],
        icon: 'positive-diagonal',
    },
    getWarnings(value: schema.DiagonalElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            if (value.positive) {
                const cells = getMajorDiagonal(true, grid).map(coord => cellCoord2CellIdx(coord, grid));
                writeRepeatingDigits(digits, cells, warnings);
            }
            if (value.negative) {
                const cells = getMajorDiagonal(false, grid).map(coord => cellCoord2CellIdx(coord, grid));
                writeRepeatingDigits(digits, cells, warnings);
            }
        }
    },
    meta: {
        description: 'Digits along the marked diagonal(s) may not repeat.',
        tags: [ 'x' ],
        category: [ 'global' ],
    },
};

export const disjointGroupsInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Disjoint Groups',
        checkbox: {
            name: 'Disjoint Groups',
            icon: 'disjoint',
        },
        icon: 'disjoint',
    },
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            for (const [ pos ] of product(grid.width)) {
                const cells: Idx<Geometry.CELL>[] = [];
                for (const [ bx ] of product(grid.width)) {
                    cells.push(cellCoord2CellIdx([ Math.floor(bx / 3) * 3 + Math.floor(pos / 3), (bx % 3) * 3 + (pos % 3)], grid));
                }
                writeRepeatingDigits(digits, cells, warnings);
            }
        }
    },
    meta: {
        description: 'Digits in the same relative position to their box may not repeat.',
        tags: [ 'subset', 'house' ],
        category: [ 'global' ],
    },
};

export const consecutiveInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Nonconsecutive',
        checkbox: [
            {
                name: 'Nonconsecutive Orthogonal Neighbors',
                icon: 'consec-orth',
                refPath: 'orth',
            },
            {
                name: 'Nonconsecutive Diagonal Neighbors',
                icon: 'consec-diag',
                refPath: 'diag',
            },
        ],
        icon: 'consec-orth',
    },
    getWarnings(value: schema.ConsecutiveElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            if (value.diag) {
                getConsecutiveWarnings(kingMoves(grid), grid, digits, warnings);
            }
            if (value.orth) {
                getConsecutiveWarnings(getOrthogonallyAdjacentPairs(grid), grid, digits, warnings);
            }
        }
    },
    meta: {
        description: '[Edge- | Corner-] adjacent digits may not be consecutive.',
        tags: [],
        category: [ 'global' ],
    },
};

export const antiXInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Anti-X',
        checkbox: {
            name: 'Anti-X',
            icon: 'anti-x',
        },
        icon: 'anti-x',
    },
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            getAntiRomanSumWarnings(grid, digits, warnings, 10);
        }
    },
    meta: {
        description: 'Adjacent digits may not sum to 10.',
        tags: [],
        category: [ 'global' ],
    },
};

export const antiVInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Anti-V',
        checkbox: {
            name: 'Anti-V',
            icon: 'anti-v',
        },
        icon: 'anti-v',
    },
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            getAntiRomanSumWarnings(grid, digits, warnings, 5);
        }
    },
    meta: {
        description: 'Adjacent digits may not sum to 5.',
        tags: [],
        category: [ 'global' ],
    },
};

export const kingInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Antiking',
        checkbox: {
            name: 'Antiking',
            icon: 'king',
        },
        icon: 'king',
    },
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            for (const coords of kingMoves(grid)) {
                // Length-two array.
                const idxes = coords.map(coord => cellCoord2CellIdx(coord, grid));
                writeRepeatingDigits(digits, idxes, warnings);
            }
        }
    },
    meta: {
        description: "Digits a chess king's move apart may not repeat.",
        tags: [ 'chess', 'move' ],
        category: [ 'global' ],
    },
};

export const knightInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Antiknight',
        checkbox: {
            name: 'Antiknight',
            icon: 'knight',
        },
        icon: 'knight',
    },
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, _regionMap: IdxMap<Geometry.CELL, number>, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (value) {
            for (const coords of knightMoves(grid)) {
                // Length-two array.
                const idxes = coords.map(coord => cellCoord2CellIdx(coord, grid));
                writeRepeatingDigits(digits, idxes, warnings);
            }
        }
    },
    meta: {
        description: "Digits a chess knight's move apart may not repeat.",
        tags: [ 'chess', 'move' ],
        category: [ 'global' ],
    },
};

export const selfTaxicabInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Self-Taxicab',
        checkbox: {
            name: 'Self-Taxicab',
            icon: 'cityblock',
        },
        icon: 'cityblock',
    },
};

function getConsecutiveWarnings(
    cellPairs: Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void>,
    grid: Grid,
    digits: IdxMap<Geometry.CELL, number>,
    warnings: IdxBitset<Geometry.CELL>,
) {
    for (const [cellA, cellB] of cellPairs) {
        const indexA = cellCoord2CellIdx(cellA, grid);
        const indexB = cellCoord2CellIdx(cellB, grid);
        const digitA = digits[indexA];
        const digitB = digits[indexB];

        if (null == digitA || null == digitB) continue;

        if (Math.abs(digitA - digitB) === 1) {
            warnings[indexA] = true;
            warnings[indexB] = true;
        }
    }
}

function getAntiRomanSumWarnings(
    grid: Grid,
    digits: IdxMap<Geometry.CELL, number>,
    warnings: IdxBitset<Geometry.CELL>,
    disallowedSum: number,
) {
    const cellPairs = getOrthogonallyAdjacentPairs(grid);

    for (const [cellA, cellB] of cellPairs) {
        const indexA = cellCoord2CellIdx(cellA, grid);
        const indexB = cellCoord2CellIdx(cellB, grid);
        const digitA = digits[indexA];
        const digitB = digits[indexB];

        if (null == digitA || null == digitB) continue;

        if (digitA + digitB === disallowedSum) {
            warnings[indexA] = true;
            warnings[indexB] = true;
        }
    }
}
