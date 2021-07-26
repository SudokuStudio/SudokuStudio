import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { InputHandler } from "../input/inputHandler";
import type { ElementInfo } from "./element";
import { getLineInputHandler } from "../input/lineInputHandler";
import { arrayObj2array } from "@sudoku-studio/board-utils";

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
};
