import { idxMapToKeysArray, cellCoord2CellIdx, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
import type { Geometry, Grid, IdxBitset } from "@sudoku-studio/schema";
import type { StateRef, Update } from "@sudoku-studio/state-manager";
import { boardState, getDigits } from "../board";
import { pushHistory } from "../history";
import { userToolState, userSelectState, userState, userPrevToolState, userCursorIsShownState, userCursorIndexState } from "../user";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "./adjacentCellPointerHandler";
import { InputHandler, parseDigit } from "./inputHandler";

const selectPointerHandler = new AdjacentCellPointerHandler(false);

export type DigitInputHandlerOptions = {
    multipleDigits: boolean,
    blockedByGivens: boolean,
    blockedByFilled: boolean,
    nextMode: string,
    digitMapping?: null | (string | number)[],
};

export function getSelectDigitInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement, options: DigitInputHandlerOptions): InputHandler {
    const { multipleDigits, blockedByGivens, blockedByFilled, digitMapping, nextMode } = options;

    const DELETE_ORDER = [ 'filled', 'corner', 'center', 'colors' ];

    function onDigitInput(code: string): boolean {
        let digit: undefined | null | number | string = parseDigit(code);

        if (digitMapping && (null != digit) && digit in digitMapping)
            digit = digitMapping[digit];

        if (undefined === digit) return false;

        const shouldDelegate = onDigitInputHelper(stateRef, digit);
        if (shouldDelegate) {
            for (const type of DELETE_ORDER) {
                const elementId = userState.get('marks', type);
                if (null == elementId) continue;

                const otherRef = boardState.ref('elements', `${elementId}`, 'value');
                if (!onDigitInputHelper(otherRef, digit)) break;
            }
        }
        return true;
    }

    function onDigitInputHelper(stateRef: StateRef, digit: null | number | string): boolean {
        const blockingDigits = getDigits(null != digit && blockedByGivens, null != digit && blockedByFilled);

        const update: Update = {};
        // Keep track of if all marks are already set, and if so delete them instead of adding them.
        let allAlreadySet = true;

        for (const cellIdx of idxMapToKeysArray(userSelectState.get<IdxBitset<Geometry.CELL>>())) {
            // Ignore filled/given digits as needed.
            if (null != blockingDigits[cellIdx]) continue;

            // Null (delete) case can fall through.
            if (multipleDigits && null != digit) {
                update[`${cellIdx}/${digit}`] = true;
                allAlreadySet &&= !!stateRef.ref(`${cellIdx}`, `${digit}`).get();
            }
            else {
                update[`${cellIdx}`] = digit;
                // Use `==` so `null == undefined`.
                allAlreadySet &&= digit == stateRef.ref(`${cellIdx}`).get();
            }
        }

        if (allAlreadySet) {
            if (null == digit) {
                // Everything we wanted to delete is already deleted, so delete something else.
                return true;
            }
            else {
                // All already set, so we need to delete instead of add.
                for (const key of Object.keys(update)) {
                    update[key] = null;
                }
            }
        }

        const diff = stateRef.update(update);
        pushHistory(diff);

        return false;
    }

    const MODE_KEYS = new Set([
        'Shift',
        'Control',
        'Alt',
        'Meta',
    ]);

    function onQuickshift(event: KeyboardEvent): boolean {
        if ('Space' === event.code) {
            if ('keydown' === event.type) {
                userToolState.replace(userState.get('marks', nextMode));
            }
            return true;
        }
        if (!MODE_KEYS.has(event.key))
            return false;

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
            // Only keyup case.
            // Add delay to handle numpad numbers force-releasing shift.
            // https://github.com/SudokuStudio/SudokuStudio/issues/24
            setTimeout(() => userToolState.replace(userPrevToolState.get()), 1);
            return true;
        }

        // Any mode key down case.
        if (null == userPrevToolState.get()) {
            userPrevToolState.replace(oldTool);
            return true;
        }
        return false;
    }

    const ARROW_KEYS = {
        ArrowLeft: [ -1, 0 ],
        ArrowUp: [ 0, -1 ],
        ArrowRight: [ 1, 0 ],
        ArrowDown: [ 0, 1 ],
    } as const;

    function onArrowKey(event: KeyboardEvent): boolean {
        if (!(event.code in ARROW_KEYS)) return false;

        const [ dx, dy ] = ARROW_KEYS[event.code as keyof typeof ARROW_KEYS];
        let [ x, y ] = cellIdx2cellCoord(userCursorIndexState.get() || 0, grid);
        x += dx + grid.width;
        y += dy + grid.height;
        x %= grid.width;
        y %= grid.height;

        const idx = cellCoord2CellIdx([ x, y ], grid);
        userCursorIndexState.replace(idx);
        userCursorIsShownState.replace(true);

        if (event.shiftKey) {
            userSelectState.ref(`${idx}`).replace(true);
        }
        else if (event.ctrlKey) {
            userSelectState.ref(`${idx}`).replace(null);
        }
        else {
            userSelectState.replace({
                [idx]: true,
            });
        }
        return true;
    }

    function onSelectionShortcut(event: KeyboardEvent): boolean {
        if (!(event.ctrlKey || event.metaKey) || 'KeyA' !== event.code) return false;

        const selectAll: IdxBitset<Geometry.CELL> = {};
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                selectAll[cellCoord2CellIdx([ x, y ], grid)] = true;
            }
        }
        userSelectState.replace(selectAll);

        return true;
    }

    return {
        load(): void {
        },
        unload(): void {
            selectPointerHandler.up();
        },

        blur(_event: FocusEvent): void {
            // Reset any tool toggles.
            userToolState.replace(userPrevToolState.get());
            // Reset selection
            userSelectState.replace({});
        },

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code) || onQuickshift(event) || onArrowKey(event) || onSelectionShortcut(event)) {
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
            selectPointerHandler.down(event, grid, svg);
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
        DESELECTING,
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
            return Mode.DESELECTING;
        }
        else {
            // No modifier: reset and select only this cell.
            return Mode.RESETTING;
        }
    }

    function handle(event: CellDragTapEvent): void {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);
        userCursorIndexState.replace(idx);
        userCursorIsShownState.replace(false);

        if (Mode.DYNAMIC === mode) {
            mode = userSelectState.ref(`${idx}`).get() ? Mode.DESELECTING : Mode.SELECTING;
        }
        userSelectState.ref(`${idx}`).replace(Mode.SELECTING === mode || null);
    }

    selectPointerHandler.onDragStart = (event: CellDragTapEvent) => {
        const { event: mouseEvent } = event;
        mode = getMode(mouseEvent);

        if (Mode.RESETTING === mode) {
            const { coord, grid } = event;
            const cellIndex = cellCoord2CellIdx(coord, grid);
            const selection = userSelectState.get<Record<string, true>>() || {};

            // Special: Tapping on a single cell acts as a toggle
            if (1 === Object.keys(selection).length && selection[cellIndex]) {
                return;
            }

            userSelectState.replace({ [cellIndex]: true });
            mode = Mode.SELECTING;
        }
        handle(event);
    };
    selectPointerHandler.onDrag = (event: CellDragTapEvent) => {
        if (Mode.RESETTING === mode) {
            mode = Mode.SELECTING;
        }
        handle(event);
    };
    selectPointerHandler.onTap = (_event: CellDragTapEvent) => {
        if (Mode.RESETTING === mode) {
            userSelectState.replace({});
        }
    };
})();
