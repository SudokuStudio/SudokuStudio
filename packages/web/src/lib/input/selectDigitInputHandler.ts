import { idxMapToKeysArray, cellCoord2CellIdx, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
import type { Geometry, Grid, Idx, IdxBitset } from "@sudoku-studio/schema";
import type { StateRef, Update } from "@sudoku-studio/state-manager";
import { boardState, getCellValue, getDigits } from "../board";
import { pushHistory } from "../history";
import { MARK_TYPES, userToolState, userSelectState, userState, userPrevToolState, userCursorIsShownState, userCursorIndexState, getUserToolStateName } from "../user";
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

    const HELD_MODE_KEYS = new Set([
        'Shift',
        'Control',
        'Alt',
        'Meta',
    ]);

    const MODE_SHORTCUTS = {
        KeyZ: 'filled',
        KeyX: 'corner',
        KeyC: 'center',
        KeyV: 'colors',
        Space: nextMode,
    } as const;

    function updateToolState(event: KeyboardEvent, newTool: string | null) {
        // Add delay to handle numpad numbers force-releasing shift
        // https://github.com/SudokuStudio/SudokuStudio/issues/24
        if (!event.shiftKey && event.getModifierState('NumLock')) {
            setTimeout(() => userToolState.replace(newTool), 1);
        } else {
            userToolState.replace(newTool);
        }
    }

    function onQuickshift(event: KeyboardEvent): boolean {
        if ('keydown' === event.type && event.code in MODE_SHORTCUTS) {
            const newToolState = userState.get(
                'marks',
                MODE_SHORTCUTS[event.code as keyof typeof MODE_SHORTCUTS]
            );
            userToolState.replace(newToolState);
            userPrevToolState.replace(newToolState);
            return true;
        }

        if (!HELD_MODE_KEYS.has(event.key))
            return false;

        const oldTool = userToolState.get();
        if (event.shiftKey) {
            if (event.ctrlKey || event.metaKey) {
                updateToolState(event, userState.get('marks', 'colors'));
            }
            else {
                updateToolState(event, userState.get('marks', 'corner'));
            }
        }
        else if (event.ctrlKey || event.metaKey) {
            updateToolState(event, userState.get('marks', 'center'));
        }
        else if (event.altKey) {
            updateToolState(event, userState.get('marks', 'colors'));
        }
        else {
            updateToolState(event, userPrevToolState.get());
            return true;
        }

        // Any mode key down case.
        if (null == userPrevToolState.get()) {
            userPrevToolState.replace(oldTool);
            return true;
        }
        return false;
    }

    const DIRECTIONAL_KEYS = {
        ArrowLeft: [ -1, 0 ],
        ArrowUp: [ 0, -1 ],
        ArrowRight: [ 1, 0 ],
        ArrowDown: [ 0, 1 ],
        KeyA: [ -1, 0 ],
        KeyW: [ 0, -1 ],
        KeyD: [ 1, 0 ],
        KeyS: [ 0, 1 ],
    } as const;

    function onDirectionalKey(event: KeyboardEvent): boolean {
        if (!(event.code in DIRECTIONAL_KEYS)) return false;
        if (event.ctrlKey || event.metaKey) return false; // Prevent Ctrl+A from triggering directional key

        const [ dx, dy ] = DIRECTIONAL_KEYS[event.code as keyof typeof DIRECTIONAL_KEYS];
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
            selectPointerHandler.mouseUp();
        },

        blur(_event: FocusEvent): void {
            // Reset any tool toggles.
            userToolState.replace(userPrevToolState.get());
            // Reset selection
            userSelectState.replace({});
        },

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code) || onQuickshift(event) || onDirectionalKey(event) || onSelectionShortcut(event)) {
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

        mouseDown(event: MouseEvent): void {
            selectPointerHandler.mouseDown(event, grid, svg);
        },
        mouseMove(event: MouseEvent): void {
            selectPointerHandler.mouseMove(event, grid, svg);
        },
        mouseUp(_event: MouseEvent): void {
            selectPointerHandler.mouseUp();
        },
        leave(event: MouseEvent): void {
            selectPointerHandler.leave(event, grid, svg);
        },
        click(event: MouseEvent): void {
            selectPointerHandler.click(event, grid, svg);
        },
        touchDown(event: TouchEvent): void {
            selectPointerHandler.touchDown(event, grid, svg);
        },
        touchMove(event: TouchEvent): void {
            selectPointerHandler.touchMove(event, grid, svg);
        },
        touchUp(event: TouchEvent): void {
            selectPointerHandler.touchUp(event, grid, svg);
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

    function getMode(mouseEvent: MouseEvent | TouchEvent): Mode {
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

    type CellMarks = {
        filled: number | null,
        colors: string[] | null,
        center: string[] | null,
        corner: string[] | null,
    };

    function getMarksInCell(cellIndex: Idx<Geometry.CELL>) {
        const cellMarks: CellMarks = {
            filled: null,
            colors: null,
            center: null,
            corner: null
        };

        for (const type of MARK_TYPES) {
            const cellValue = getCellValue(type, cellIndex) as number | object | null;

            if ('filled' === type) {
                const givenValue = getCellValue('givens', cellIndex) as number | null;

                if (null != givenValue) {
                    cellMarks.filled = givenValue as number;
                } else if (null != cellValue) {
                    cellMarks.filled = cellValue as number;
                }
            } else if (null != cellValue) {
                const markedDigits = Object.keys(cellValue as object);

                if ('center' === type) {
                    cellMarks.center = markedDigits;
                } else if ('corner' === type) {
                    cellMarks.corner = markedDigits;
                } else if ('colors' === type) {
                    cellMarks.colors = markedDigits;
                }
            }
        }

        // Filled digits hide center and corner marks
        if (null != cellMarks.filled) {
            cellMarks.center = null;
            cellMarks.corner = null;
        }

        return cellMarks;
    }

    const CELL_MARKS_PRIORITY = ['filled', 'colors', 'center', 'corner'] as const;

    function getDoubleClickCriteria(selectedCellMarks: CellMarks): keyof CellMarks | null {
        const selectedTool = getUserToolStateName(userToolState.get()) as keyof CellMarks;

        if (null != selectedCellMarks[selectedTool]) {
            return selectedTool;
        }

        for (const type of CELL_MARKS_PRIORITY) {
            if (null != selectedCellMarks[type]) {
                return type;
            }
        }

        return null;
    }

    function cellMatchesCriteria(criteria: keyof CellMarks, selectedCellMarks: CellMarks, otherCellMarks: CellMarks): boolean {
        if ('filled' === criteria) {
            return otherCellMarks.filled === selectedCellMarks.filled!;
        }
        if ('colors' === criteria) {
            return selectedCellMarks.colors!.some((color) => otherCellMarks.colors?.includes(color));
        }
        if ('center' === criteria) {
            return selectedCellMarks.center!.every((digit) => otherCellMarks.center?.includes(digit));
        }
        if ('corner' === criteria) {
            return selectedCellMarks.corner!.some((digit) => otherCellMarks.corner?.includes(digit));
        }
        return false;
    }

    function getCellsByCriteria(criteria: keyof CellMarks, selectedCellMarks: CellMarks, grid: Grid): Record<string, true> {
        const matchingCells: Record<string, true> = {};

        for (let x = 0; x < grid.width; x++) {
            for (let y = 0; y < grid.height; y++) {
                const cellIndex = cellCoord2CellIdx([x, y], grid);
                const otherCellMarks = getMarksInCell(cellIndex);

                if (cellMatchesCriteria(criteria, selectedCellMarks, otherCellMarks)) {
                    matchingCells[cellIndex] = true;
                }
            }
        }

        return matchingCells;
    }

    function handleDoubleClick(event: CellDragTapEvent): void {
        const { coord, grid } = event;

        const cellIndex = cellCoord2CellIdx(coord, grid);
        const selectedCellMarks = getMarksInCell(cellIndex)
        const criteria = getDoubleClickCriteria(selectedCellMarks);

        if (null == criteria) {
            return; // Selected cell is empty
        }

        const matchingCells = getCellsByCriteria(criteria, selectedCellMarks, grid);
        userSelectState.replace(matchingCells);
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
    selectPointerHandler.onDoubleTap = (event: CellDragTapEvent) => {
        handleDoubleClick(event);
    };
})();
