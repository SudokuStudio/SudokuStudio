import type { Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { click2svgCoord, svgCoord2edgeIdx } from "@sudoku-studio/board-utils";
import { InputHandler, parseDigit } from "../input/inputHandler";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { pushHistory } from "../history";

export const differenceInfo: ElementInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Differences',
        icon: 'kropki',
    },
};

export const ratioInfo: ElementInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Ratios',
        icon: 'kropki',
    },
};

export const xvInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getInputHandler(ref, grid, svg, {
            keymap: {
                // TODO this is jank.
                'KeyX': 10,
                'KeyV': 5,
            },
            max: 100,
        })
    },

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'XV Sums',
        icon: 'xv',
    },
};

function getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement, options: { keymap?: Record<string, number | null>, max: number } = { max: 10 }): InputHandler {
    const keymap = options.keymap || {};
    const { max } = options;

    let edgeRef: null | StateRef = null;

    function onDigitInput(code: string): boolean {
        if (null == edgeRef) return false;

        let digit = undefined;
        if (code in keymap) {
            digit = keymap[code];
        }
        else {
            digit = parseDigit(code)
        };
        if (undefined === digit) return false;

        const oldVal = edgeRef.get<true | number>();
        if (null != digit && 'number' === typeof oldVal) {
            const multiDigit = oldVal * 10 + digit;
            if (multiDigit < max)
                digit = multiDigit;
        }

        const diff = edgeRef.replace(digit ?? (true !== oldVal || null));
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
            const idx = svgCoord2edgeIdx(click2svgCoord(event, svg), grid);
            if (null == idx) return;
            const clickedEdgeRef = ref.ref(`${idx}`);

            if (true === clickedEdgeRef.get()) {
                // Delete empty.
                clickedEdgeRef.replace(null);
                return;
            }
            // Otherwise clear or create new.
            edgeRef = clickedEdgeRef;
            onDigitInput('Delete');
        },
    }
}
