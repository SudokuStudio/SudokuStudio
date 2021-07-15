import { bitsetToList, cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import type { Geometry, Grid, IdxBitset } from "@sudoku-studio/schema";
import type { StateRef, Update } from "@sudoku-studio/state-manager";
import { userToolState, userSelectState, userState, userPrevToolState } from "../user";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "./adjacentCellPointerHandler";
import { InputHandler, parseDigit } from "./inputHandler";

const selectPointerHandler = new AdjacentCellPointerHandler(false);

export function getSelectDigitInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement, multipleDigits: boolean): InputHandler {
    function onDigitInput(code: string): boolean {
        const digit = parseDigit(code);
        if (undefined === digit) return false;

        const update: Update = {};
        for (const cellIdx of bitsetToList(userSelectState.get<IdxBitset<Geometry.CELL>>())) {
            // Null (delete) case can fall through.
            if (multipleDigits && null != digit) {
                update[`${cellIdx}/${digit}`] = true;
            }
            else {
                update[`${cellIdx}`] = digit;
            }
        }
        ref.update(update);

        return true;
    }

    function onQuickshift(event: KeyboardEvent): boolean {
        const modeKeys = new Set([
            'Shift',
            'Control',
            'Alt',
            'Meta',
        ]);

        if (!modeKeys.has(event.key)) return false;

        const oldTool = userToolState.get();
        if (event.shiftKey) {
            if (event.ctrlKey || event.metaKey) {
                userToolState.replace(userState.get('marks', 'colors'));
            }
            else {
                userToolState.replace(userState.get('marks', 'corner'));
            }
        }
        else if (event.ctrlKey || event.metaKey) {
            userToolState.replace(userState.get('marks', 'center'));
        }
        else if (event.altKey) {
            userToolState.replace(userState.get('marks', 'colors'));
        }
        else {
            userToolState.replace(userPrevToolState.get());
            userPrevToolState.replace(null);
            return true;
        }

        if (null == userPrevToolState.get()) {
            userPrevToolState.replace(oldTool);
            return true;
        }
        return false;
    }

    return {
        load(): void {
        },
        unload(): void {
            selectPointerHandler.up();
        },

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code) || onQuickshift(event)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        keyup(event: KeyboardEvent): void {
            if (onQuickshift(event)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
            onDigitInput(event.currentTarget.value);
        },

        down(event: MouseEvent): void {
            selectPointerHandler.down(event);
        },
        move(event: MouseEvent): void {
            selectPointerHandler.move(event, grid, svg);
        },
        up(_event: MouseEvent): void {
            selectPointerHandler.up();
        },
        leave(event: MouseEvent): void {
            selectPointerHandler.leave(event, grid, svg);
        },
        click(event: MouseEvent): void {
            selectPointerHandler.click(event, grid, svg);
        },
    } as const;
}

(() => {
    enum Mode {
        // Mode when starting a *NEW* selection.
        RESETTING,
        // Mode when we are either selecting or deselecting based on the
        // opposite of the first cell hit.
        DYNAMIC,

        // Mode when user is selecting.
        SELECTING,
        // Mode when user is deselecting.
        DESELCTING,
    }

    // The selecting mode.
    let mode = Mode.RESETTING;

    function getMode(mouseEvent: MouseEvent): Mode {
        if (mouseEvent.shiftKey) {
            // Shift: always select.
            return Mode.SELECTING;
        }
        else if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            // Ctrl: deselect if clicked cell is selected, otherwise select.
            return Mode.DYNAMIC;
        }
        else if (mouseEvent.altKey) {
            // Alt: always deselect.
            return Mode.DESELCTING;
        }
        else {
            // No modifier: reset and select only this cell.
            return Mode.RESETTING;
        }
    }

    function handle(event: CellDragTapEvent, isClick: boolean): void {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.RESETTING === mode) {
            // Special: Resetting *tap* acts as toggle.
            const select = isClick && userSelectState.get<Record<string, true>>() || {};
            if (isClick && 1 === Object.keys(select).length && select[`${idx}`]) {
                userSelectState.replace({})
            }
            // Normal:
            else {
                userSelectState.replace({ [`${idx}`]: true });
            }
            mode = Mode.SELECTING;
            return;
        }

        if (Mode.DYNAMIC === mode) {
            mode = userSelectState.ref(`${idx}`).get() ? Mode.DESELCTING : Mode.SELECTING;
        }
        userSelectState.ref(`${idx}`).replace(Mode.SELECTING === mode || null);
    }

    selectPointerHandler.onDragStart = (event: MouseEvent) => {
        mode = getMode(event);
    };
    selectPointerHandler.onDrag = (event: CellDragTapEvent) => {
        handle(event, false);
    };
    // selectPointerHandler.onDragEnd = (event: MouseEvent) => {
    //     // mode = Mode.;
    // };

    selectPointerHandler.onTap = (event: CellDragTapEvent) => {
        handle(event, true);
    };
})();
