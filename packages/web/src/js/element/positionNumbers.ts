import type { Coord, Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { cellCoord2CellIdx, click2svgCoord, diagonalIdx2diagonalCellCoords, edgeIdx2cellIdxes, seriesIdx2CellCoords, svgCoord2diagonalIdx, svgCoord2edgeIdx, svgCoord2seriesIdx, warnSum } from "@sudoku-studio/board-utils";
import { getTouchPosition, InputHandler, parseDigit } from "../input/inputHandler";
import { userCursorIsShownState, userSelectState } from "../user";
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
    meta: {
        description: 'Cells separated by a white dot must differ by 1, or the number given.',
        tags: [ 'dot', 'edge', 'white', 'kropki', 'consecutive', 'pair' ],
        category: [ 'local', 'adj' ],
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
    meta: {
        description: 'Cells separated by a black dot must have a ratio of 2, or the number given.',
        tags: [ 'dot', 'edge', 'black', 'kropki', 'times', 'multiply', 'pair' ],
        category: [ 'local', 'adj' ],
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
    meta: {
        description: 'Cells separated by a roman numeral must sum to that number.',
        tags: [ 'roman numeral', 'roman number', 'sum' ],
        category: [ 'local', 'adj' ],
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
    getWarnings(value: schema.LittleKillerElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ diagonalIdx, sum ] of Object.entries(value || {})) {
            if ('number' !== typeof sum) continue;

            const cellsArr = diagonalIdx2diagonalCellCoords(+diagonalIdx, grid).map(coord => cellCoord2CellIdx(coord, grid));
            warnSum(digits, cellsArr, warnings, sum);
        }
    },
    meta: {
        description: 'Digits along a diagonal must sum to the given total; digits may repeat.',
        tags: [ 'diagonal', 'sum', 'repeat', 'outside' ],
        category: [ 'local', 'cell' ],
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
    getWarnings(value: schema.SeriesNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ seriesIdx, sum ] of Object.entries(value || {})) {
            if ('number' !== typeof sum) continue;

            const seriesCells = seriesIdx2CellCoords(+seriesIdx, grid).map(coord => cellCoord2CellIdx(coord, grid));
            const seriesDigits = seriesCells.map(idx => digits[idx]);

            const iMin = seriesDigits.indexOf(1);
            const iMax = seriesDigits.indexOf(grid.width);
            if (iMin < 0 || iMax < 0) continue;

            const i = Math.min(iMin, iMax);
            const j = Math.max(iMin, iMax);

            if (warnSum(digits, seriesCells.slice(i + 1, j), warnings, sum)) {
                warnings[seriesCells[iMin]] = true;
                warnings[seriesCells[iMax]] = true;
            }
        }
    },
    meta: {
        description: 'Sandwich clues outside the grid indicate the sum of the digits between the 1 and the 9 (or min and max) in the indicated row or column.',
        tags: [ 'outside', 'series', 'sum', 'crust', 'filling' ],
        category: [ 'local', 'outside' ],
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
    getWarnings(value: schema.SeriesNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ seriesIdx, numVisible ] of Object.entries(value || {})) {
            if ('number' !== typeof numVisible) continue;

            const seriesCells = seriesIdx2CellCoords(+seriesIdx, grid).map(coord => cellCoord2CellIdx(coord, grid));

            let numVisibleActual = 0;
            let max = Number.NEGATIVE_INFINITY;
            let i = 0;
            for (; i < seriesCells.length; i++) {
                const cellIdx = seriesCells[i];
                const digit = digits[cellIdx];
                if (null == digit) break;

                if (max < digit) {
                    max = digit;
                    numVisibleActual++;

                    if (numVisible < numVisibleActual) break;
                }
            }

            const allFilled = i === seriesCells.length;
            if (numVisible < numVisibleActual || (allFilled && numVisible !== numVisibleActual)) {
                seriesCells.map(idx => warnings[idx] = true);
            }
        }
    },
    meta: {
        description: 'Skyscraper clues outside the grid indicate the number of digits greater than all previous digits in that direction.',
        tags: [ 'outside', 'series', 'tower', 'see' ],
        category: [ 'local', 'outside' ],
    },
};

export const xsumInfo: ElementInfo = {
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
        name: 'X-Sum',
        icon: 'xsum',
    },
    getWarnings(value: schema.SeriesNumberElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ seriesIdx, xsum ] of Object.entries(value || {})) {
            if ('number' !== typeof xsum) continue;

            const seriesCells = seriesIdx2CellCoords(+seriesIdx, grid).map(coord => cellCoord2CellIdx(coord, grid));
            const xsumLength = digits[seriesCells[0]];

            if (null == xsumLength) continue;

            warnSum(digits, seriesCells.slice(0, xsumLength), warnings, xsum);
        }
    },
    meta: {
        description: 'The first x digits (including the first cell) must sum to the number clued outside of the grid, where x is the first cell in the row or column.',
        tags: [ 'outside', 'series' ],
        category: [ 'local', 'outside' ],
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

    function handleClick(mousePosition: { offsetX: number, offsetY: number }) {
        const idx = svgCoord2idx(click2svgCoord(mousePosition, svg), grid);
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
    }

    return {
        load(): void {
            // TODO: not really that great of a way of doing this.
            userSelectState.replace(null);
            userCursorIsShownState.replace(false);
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

        mouseDown(_event: MouseEvent): void {
        },
        mouseMove(_event: MouseEvent): void {
        },
        mouseUp(_event: MouseEvent): void {
        },
        leave(_event: MouseEvent): void {
        },
        click(event: MouseEvent): void {
            handleClick(event);
        },
        touchDown(event: TouchEvent): void {
            const touchPosition = getTouchPosition(event);
            if (null == touchPosition) return;

            handleClick(touchPosition);
        },
        touchMove(_event: TouchEvent): void {
        },
        touchUp(_event: TouchEvent): void {
        },
    }
}
