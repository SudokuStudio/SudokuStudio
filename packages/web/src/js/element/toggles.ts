import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import { cellCoord2CellIdx, getMajorDiagonal, writeRepeatingDigits } from "../../../../board-utils/lib/board-utils";
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
    },
};

export const consecutiveDiagonalInfo: ElementInfo = {
    inGlobalMenu: true,
    order: 0,
    menu: {
        type: 'checkbox',
        name: 'Nonconsecutive Diag.',
        checkbox: {
            name: 'Nonconsecutive',
            icon: 'nonconsecutive',
        },
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
    },
};
