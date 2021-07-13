import type { Grid, Idx, Coord, Geometry, IdxBitset } from "@sudoku-studio/schema";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord, bitsetToList, distSq, cellLine, isOnGrid } from "@sudoku-studio/board-utils";
import { StateManager } from "@sudoku-studio/state-manager";
import { filledState } from "./board";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {
    },
});

const DIGIT_REGEX = /^Digit(\d)$/;
const KEYCODES = {
    Delete: null,
    Backspace: null,
} as const;

export const keydown = (event: KeyboardEvent) => {
    // Null means delete.
    let num: null | undefined | number = undefined;

    if (event.code in KEYCODES) {
        num = KEYCODES[event.code as keyof typeof KEYCODES];
    }
    else {
        const match = DIGIT_REGEX.exec(event.code);
        if (match) num = Number(match[1]);
    }
    if (undefined === num) return;

    // TODO: Use a helper function to handle buttons as well.
    const selection = bitsetToList(userState.get<IdxBitset<Geometry.CELL>>('select'));
    const update: Record<string, number | null> = {};
    for (const cellIdx of selection) {
        update[`${cellIdx}`] = num;
    }
    filledState.update(update);
};


/**
 * A handler of pointer movement - only considers the position of the pointer
 * and the SVG board element. Doesn't consider clicks or any input mode state.
 * This pointer movement handler emits cells such that each cell is adjacent,
 * either orthogonally or diagonally, to the previous cell (as long as the
 * pointer remains over the board)
 */
class AdjacentCellPointerMovementHandler {
    private readonly _handler: (cell: Coord<Geometry.CELL>, grid: Grid) => void;
    private _prevPos: Coord<Geometry.SVG> | null = null;

    constructor(handler: (cell: Coord<Geometry.CELL>, grid: Grid) => void) {
        this._handler = handler;
    }

    move(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        const pos = click2svgCoord(event, svg);

        // Interpolate if mouse jumped cells within the board.
        if (null != this._prevPos && 1 < distSq(this._prevPos, pos)) {
            for (const coord of cellLine(this._prevPos, pos, grid)) {
                (this._handler)(coord, grid);
            }
            this._prevPos = isOnGrid(pos, grid) ? pos : null;
        }
        // Otherwise select the current cell.
        else {
            const isFirstClick = null == this._prevPos;
            const coord = svgCoord2cellCoord(pos, grid, !isFirstClick);
            if (null != coord) {
                (this._handler)(coord, grid)
                this._prevPos = pos;
            }
            // Otherwise otherwise reset prevPos if pointer's off the grid.
            else if (!isOnGrid(pos, grid)) {
                this._prevPos = null;
            }
        }
    }

    reset(): void {
        this._prevPos = null;
    }
}

export const mouseHandlers = (() => {
    enum State {
        // State when nothing has happened.
        NONE,
        // State when user begins selecting.
        SELECTING,
        // State when user begins deselecting.
        DESELCTING,
        // State when we are either selecting or deselecting based on the
        // opposite of the first cell hit.
        DYNAMIC,
    }
    // The selecting state.
    let state = State.NONE;

    // A cell that, if the click finishes, will trigger the special single-selected-cell deselect.
    let startClickCell: Idx<Geometry.CELL> | null = null;

    const movementHandler = new AdjacentCellPointerMovementHandler((coord, grid) => {
        if (State.NONE !== state) {
            const idx = cellCoord2CellIdx(coord, grid);
            if (State.DYNAMIC === state) {
                state = userState.get('select', `${idx}`) ? State.DESELCTING : State.SELECTING;
            }
            userState.ref('select', `${idx}`).replace(State.SELECTING === state || null);
        }
    });

    // Event order for a click is `mousedown` -> `mouseup` -> `click`.
    return {
        down(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (event.shiftKey) {
                // Shift: always select.
                state = State.SELECTING;
            }
            else if (event.ctrlKey || event.metaKey) {
                // Ctrl: deselect if clicked cell is selected, otherwise select.
                state = State.DYNAMIC;
            }
            else if (event.altKey) {
                // Alt: always deselect.
                state = State.DESELCTING;
            }
            else {
                // No modifier: reset and select only this cell.
                {
                    // Special handling for single-click toggle.
                    const coord = svgCoord2cellCoord(click2svgCoord(event, svg), grid, false);
                    if (coord != null) {
                        const idx = cellCoord2CellIdx(coord, grid);
                        const select = userState.get<Record<string, true>>('select') || {};
                        if (1 === Object.keys(select).length && select[`${idx}`]) {
                            startClickCell = idx;
                        }
                    }
                }
                userState.ref('select').replace({});
                state = State.SELECTING;
            }
            movementHandler.move(event, grid, svg);
        },
        move(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (State.NONE !== state) {
                startClickCell = null;
                movementHandler.move(event, grid, svg);
            }
        },
        // Mouse up is on window to handle dragging mouse out of grid.
        up(_event: MouseEvent, _grid: Grid, _svg: SVGSVGElement) {
            state = State.NONE;
            movementHandler.reset();
        },
        leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (State.NONE !== state)
                movementHandler.move(event, grid, svg);
        },

        // For special single-selected-cell deselect click.
        click(event: MouseEvent, _grid: Grid, _svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (null != startClickCell) {
                // Deselect the one selected cell, AKA just unselect all.
                userState.ref('select').replace(null);
                startClickCell = null;
            }
        },
    };
})();
