import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { InputHandler } from "../input/inputHandler";
import type { ElementInfo } from "./element";
import { getLineInputHandler } from "../input/lineInputHandler";
import { arrayObj2array, warnClones } from "@sudoku-studio/board-utils";

export const thermoInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: false,
            allowSelfIntersection: false,
        });
    },
    order: 30,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Thermo',
        icon: 'thermo',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        getThermoWarnings(value, digits, warnings, true);
    },
    meta: {
        description: 'Digits on thermos increase from bulb to tip and may not repeat.',
        tags: [ 'line', 'non-repeat', 'thermometer' ],
        category: [ 'local', 'line' ],
    },
};

export const slowThermoInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: false,
            allowSelfIntersection: false,
        });
    },
    order: 30,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Slow Thermo',
        icon: 'slow-thermo',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        getThermoWarnings(value, digits, warnings, false);
    },
    meta: {
        description: 'Digits on slow thermos increase or stay the same from bulb to tip; digits may repeat.',
        tags: [ 'line', 'repeat', 'thermometer' ],
        category: [ 'local', 'line' ],
    },
};

function getThermoWarnings(
    value: schema.LineElement['value'],
    digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>,
    strict: boolean): void
{
    for (const cells of Object.values(value || {})) {
        const cellsArr = arrayObj2array(cells);

        {
            let maxSeen = Number.NEGATIVE_INFINITY;
            for (const cellIdx of cellsArr) {
                const digit = digits[cellIdx];
                if (null == digit) continue;

                if (maxSeen < digit) {
                    maxSeen = digit;
                }
                else if (maxSeen == digit) {
                    warnings[cellIdx] = strict;
                }
                else { // maxSeen > digit.
                    warnings[cellIdx] = true;
                }
            }
        }

        {
            cellsArr.reverse();
            let minSeen = Number.POSITIVE_INFINITY;
            for (const cellIdx of cellsArr) {
                const digit = digits[cellIdx];
                if (null == digit) continue;

                if (minSeen > digit) {
                    minSeen = digit;
                }
                else if (minSeen == digit) {
                    if (strict) warnings[cellIdx] = true;
                }
                else { // maxSeen < digit.
                    warnings[cellIdx] = true;
                }
            }
        }
    }
}

export const betweenInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: true,
            allowSelfIntersection: true,
        });
    },
    order: 50,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Between',
        icon: 'between',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const cells of Object.values(value || {})) {
            const betweenCells = arrayObj2array(cells);
            if (3 > betweenCells.length) continue;

            const headIdx = betweenCells.shift()!;
            const tailIdx = betweenCells.pop()!;

            const headVal = digits[headIdx];
            const tailVal = digits[tailIdx];
            if (null == headVal || null == tailVal) continue;

            const min = Math.min(headVal, tailVal);
            const max = Math.max(headVal, tailVal);

            for (const betweenIdx of betweenCells) {
                const digit = digits[betweenIdx];
                if (null != digit && (digit <= min || max <= digit)) {
                    warnings[betweenIdx] = true;
                    warnings[headIdx] = true;
                    warnings[tailIdx] = true;
                }
            }
        }
    },
    meta: {
        description: 'Digits on between lines must be greater than one circle and less than the other; digits may repeat.',
        tags: [ 'line', 'range' ],
        category: [ 'local', 'line' ],
    },
};

export const doubleArrowInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: true,
            allowSelfIntersection: true,
        });
    },
    order: 50,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Double Arrow',
        icon: 'double-arrow',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const cells of Object.values(value || {})) {
            const lineCells = arrayObj2array(cells);
            if (3 > lineCells.length) continue;

            const headIdx = lineCells.shift()!;
            const tailIdx = lineCells.pop()!;

            const headVal = digits[headIdx];
            const tailVal = digits[tailIdx];
            if (null == headVal || null == tailVal) continue;

            const targetSum = headVal + tailVal;
            let actualSum = 0;
            let allFilled = true;
            for (const bodyIdx of lineCells) {
                const digit = digits[bodyIdx];
                if (null == digit) {
                    allFilled = false;
                }
                else {
                    actualSum += digit;
                }
            }

            if (targetSum < actualSum || (allFilled && targetSum !== actualSum)) {
                warnings[headIdx] = true;
                warnings[tailIdx] = true;
                lineCells.forEach(idx => warnings[idx] = true);
            }
        }
    },
    meta: {
        description: 'Digits on the line must have the same sum as the two circles; digits may repeat.',
        tags: [ 'line', 'sum' ],
        category: [ 'local', 'line' ],
    },
};

export const palindromeInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
            allowSelfIntersection: true,
        });
    },
    order: 60,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Palindrome',
        icon: 'palindrome',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const cells of Object.values(value || {})) {
            const cellsArr = arrayObj2array(cells);

            const cellsA = cellsArr.slice(0, cellsArr.length >> 1);
            const cellsB = cellsArr.slice(-cellsA.length);
            cellsB.reverse();

            warnClones(digits, cellsA, cellsB, warnings);
        }
    },
    meta: {
        description: 'Digits along palindromes must read the same from both ends.',
        tags: [ 'line' ],
        category: [ 'local', 'line' ],
    },
};

export const whisperInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
            allowSelfIntersection: true,
        });
    },
    order: 70,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Whisper',
        icon: 'whisper',
    },
    getWarnings(value: schema.LineElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        const delta = (grid.width + 1) >> 1; // TODO: make this configurable somehow.

        for (const cells of Object.values(value || {})) {
            const cellsArr = arrayObj2array(cells);

            for (let i = 1; i < cellsArr.length; i++) {
                const prevIdx = cellsArr[i - 1];
                const nextIdx = cellsArr[i];

                const prevDigit = digits[prevIdx];
                const nextDigit = digits[nextIdx];

                if (null == prevDigit || null == nextDigit) continue;

                if (Math.abs(prevDigit - nextDigit) < delta) {
                    warnings[prevIdx] = true;
                    warnings[nextIdx] = true;
                }
            }
        }
    },
    meta: {
        description: 'Adjacent digits along whispers must differ by at least 5; digits may repeat.',
        tags: [ 'line', 'german', 'five', '5' ],
        category: [ 'local', 'line' ],
    },
};

export const renbanInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
            allowSelfIntersection: false,
        });
    },
    order: 80,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Renban',
        icon: 'renban',
    },
    getWarnings(value: schema.LineElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        outer:
        for (const cells of Object.values(value || {})) {
            const cellsArr = arrayObj2array(cells);

            const seen: number[] = [];
            for (const cellIdx of cellsArr) {
                const digit = digits[cellIdx];
                if (null == digit) {
                    continue outer; // Not complete.
                }
                seen.push(digit);
            }

            seen.sort((a, b) => a - b);
            for (let i = 1; i < seen.length; i++) {
                if (seen[i - 1] + 1 !== seen[i]) {
                    cellsArr.forEach(idx => warnings[idx] = true);
                    continue outer;
                }
            }
        }
    },
    meta: {
        description: 'Digits along renban lines must be in a consecutive set in any order; digits may not repeat.',
        tags: [ 'line', 'non-repeat' ],
        category: [ 'local', 'line' ],
    },
};
