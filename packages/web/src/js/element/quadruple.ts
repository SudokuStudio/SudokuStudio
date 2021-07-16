import type { Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { click2svgCoord, cornerCoord2cornerIdx, svgCoord2cornerCoord } from "@sudoku-studio/board-utils";
import { InputHandler, parseDigit } from "../input/inputHandler";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { pushHistory } from "../history";

export const quadrupleInfo: ElementInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Quadruple',
        icon: 'quadruple',
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
