import type { Coord, Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { click2svgCoord, edgeIdx2cellIdxes, svgCoord2diagonalIdx, svgCoord2edgeIdx, svgCoord2seriesIdx } from "@sudoku-studio/board-utils";
import { InputHandler, parseDigit } from "../input/inputHandler";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { pushHistory } from "../history";

export const differenceInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2edgeIdx,
            max: 10,
        });
    },
    order: 140,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Difference',
        icon: 'kropki',
    },
    getWarnings(value: schema.EdgeNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ edgeIdx, differenceOrTrue ] of Object.entries(value || {})) {
            if (null == differenceOrTrue) continue;
            const difference = true === differenceOrTrue ? 1 : differenceOrTrue;

            const [ idxA, idxB ] = edgeIdx2cellIdxes(+edgeIdx, grid);
            const digitA = digits[idxA];
            const digitB = digits[idxB];
            if (null == digitA || null == digitB) continue;

            if (Math.abs(digitA - digitB) !== difference) {
                warnings[idxA] = true;
                warnings[idxB] = true;
            }
        }
    },
};

export const ratioInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2edgeIdx,
            max: 10,
        });
    },
    order: 141,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Ratio',
        icon: 'kropki',
    },
    getWarnings(value: schema.EdgeNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ edgeIdx, ratioOrTrue ] of Object.entries(value || {})) {
            if (null == ratioOrTrue) continue;
            const ratio = true === ratioOrTrue ? 2 : ratioOrTrue;

            const [ idxA, idxB ] = edgeIdx2cellIdxes(+edgeIdx, grid);
            const digitA = digits[idxA];
            const digitB = digits[idxB];
            if (null == digitA || null == digitB) continue;

            if (digitA * ratio !== digitB && digitB * ratio !== digitA) {
                warnings[idxA] = true;
                warnings[idxB] = true;
            }
        }
    },
};

export const xvInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2edgeIdx,
            keymap: {
                // TODO this is jank.
                'KeyX': 10,
                'KeyV': 5,
            },
            max: 100,
        });
    },
    order: 142,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'XV Sum',
        icon: 'xv',
    },
    getWarnings(value: schema.EdgeNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ edgeIdx, sum ] of Object.entries(value || {})) {
            if ('number' !== typeof sum) continue;

            const [ idxA, idxB ] = edgeIdx2cellIdxes(+edgeIdx, grid);
            const digitA = digits[idxA];
            const digitB = digits[idxB];
            if (null == digitA || null == digitB) continue;

            if (digitA + digitB !== sum) {
                warnings[idxA] = true;
                warnings[idxB] = true;
            }
        }
    },
};

export const littleKillerInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2diagonalIdx,
            max: 100,
        });
    },
    order: 160,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Little Killer',
        icon: 'little-killer',
    },
};

export const sandwichInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2seriesIdx,
            max: 100,
        });
    },
    order: 150,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Sandwich',
        icon: 'sandwich',
    },
};

export const skyscraperInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2seriesIdx,
            max: Math.max(grid.width, grid.height),
        });
    },
    order: 151,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Skyscraper',
        icon: 'skyscraper',
    },
};

export const xsumsInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            svgCoord2idx: svgCoord2seriesIdx,
            max: 100,
        });
    },
    order: 152,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'X-Sums',
        icon: 'xv',
    },
};




type PositionNumberInputHandlerOptions<TAG extends Geometry> = {
    svgCoord2idx: (coord: Coord<Geometry.SVG>, grid: Grid) => null | Idx<TAG>,
    max: number,

    keymap?: Record<string, number | null>,
};

function getInputHandler<TAG extends Geometry>(ref: StateRef, grid: Grid, svg: SVGSVGElement, options: PositionNumberInputHandlerOptions<TAG>): InputHandler {
    const keymap = options.keymap || {};
    const { max, svgCoord2idx } = options;

    let idxRef: null | StateRef = null;

    function onDigitInput(code: string): boolean {
        if (null == idxRef) return false;

        let digit = undefined;
        if (code in keymap) {
            digit = keymap[code];
        }
        else {
            digit = parseDigit(code)
        };
        if (undefined === digit) return false;

        const oldVal = idxRef.get<true | number>();
        if (null != digit && 'number' === typeof oldVal) {
            const multiDigit = oldVal * 10 + digit;
            if (multiDigit < max)
                digit = multiDigit;
        }

        const diff = idxRef.replace(digit ?? (true !== oldVal || null));
        pushHistory(diff);

        return true;
    }

    return {
        load(): void {
            // TODO: not really that great of a way of doing this.
            userSelectState.replace(null);
            userCursorState.replace(null);
        },
        unload(): void {
        },

        blur(_event: FocusEvent): void {
        },

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        keyup(_event: KeyboardEvent): void {
        },
        padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
            if (onDigitInput(event.currentTarget.value)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },

        down(_event: MouseEvent): void {
        },
        move(_event: MouseEvent): void {
        },
        up(_event: MouseEvent): void {
        },
        leave(_event: MouseEvent): void {
        },
        click(event: MouseEvent): void {
            const idx = svgCoord2idx(click2svgCoord(event, svg), grid);
            if (null == idx) return;
            const clickedIdxRef = ref.ref(`${idx}`);

            if (true === clickedIdxRef.get()) {
                // Delete empty.
                clickedIdxRef.replace(null);
                return;
            }
            // Otherwise clear or create new.
            idxRef = clickedIdxRef;
            onDigitInput('Delete');
        },
    }
}
