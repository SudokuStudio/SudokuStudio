import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import { cellCoord2CellIdx, getMajorDiagonal, kingMoves, knightMoves, writeRepeatingDigits } from "../../../../board-utils/lib/board-utils";
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
    getWarnings(value: schema.DiagonalElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
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
    meta: {
        description: '[Edge- | Corner-] adjacent digits may not be consecutive.',
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
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
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
    getWarnings(value: schema.BooleanElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
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
