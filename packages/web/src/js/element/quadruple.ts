import type { ArrayObj, Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { arrayObj2array, cellCoord2CellIdx, click2svgCoord, cornerCoord2cellCoords, cornerCoord2cornerIdx, cornerIdx2cornerCoord, svgCoord2cornerCoord } from "@sudoku-studio/board-utils";
import { InputHandler, parseDigit } from "../input/inputHandler";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { pushHistory } from "../history";

export const quadrupleInfo: ElementInfo = {
    getInputHandler,
    order: 110,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Quadruple',
        icon: 'quadruple',
    },
    getWarnings(value: schema.QuadrupleElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const [ cornerIdx, reqValues ] of Object.entries(value || {})) {
            const reqValuesArr = arrayObj2array((reqValues || {}) as ArrayObj<number>);

            const cells = cornerCoord2cellCoords(cornerIdx2cornerCoord(+cornerIdx, grid), grid).map(coord => cellCoord2CellIdx(coord, grid));
            const actualValues = cells.map(idx => digits[idx]);
            if (actualValues.some(idx => null == idx)) continue;

            for (const actualValue of actualValues as number[]) {
                const i = reqValuesArr.indexOf(actualValue);
                if (-1 !== i) {
                    reqValuesArr.splice(i, 1);
                }
            }

            if (0 < reqValuesArr.length) {
                cells.map(idx => warnings[idx] = true);
            }
        }
    },
};

function getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const digits: number[] = [];
    let cornerRef: null | StateRef = null;

    function onDigitInput(code: string): boolean {
        if (null == cornerRef) return false;

        const digit = parseDigit(code);
        if (undefined === digit) return false;

        if (null == digit) {
            if (true === cornerRef.get<true | ArrayObj<number>>()) {
                // Already empty -> delete.
                const diff = cornerRef.replace(null);
                pushHistory(diff);
                return true;
            }
            digits.length = 0;
        }
        else {
            if (4 <= digits.length) return false;
            digits.push(digit);
            digits.sort();
        }

        const diff = cornerRef.replace(0 < digits.length ? digits : true);
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
            const coord = svgCoord2cornerCoord(click2svgCoord(event, svg), grid);
            if (null == coord) return;

            const idx = cornerCoord2cornerIdx(coord, grid);
            const clickedCornerRef = ref.ref(`${idx}`);

            if (true === clickedCornerRef.get()) {
                // Delete empty.
                clickedCornerRef.replace(null);
                return;
            }
            // Otherwise clear or create new.
            cornerRef = clickedCornerRef;
            onDigitInput('Delete');
        },
    }
}
