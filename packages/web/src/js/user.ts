import type { Grid, Idx, Coord, Geometry, IdxBitset } from "@sudoku-studio/schema";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord, bitsetToList, distSq, cellLine, isOnGrid, BOX_THICKNESS } from "@sudoku-studio/board-utils";
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
    private readonly _handler: (cell: Coord<Geometry.CELL>) => void;
    private _prevPos: Coord<Geometry.SVG> | null = null;

    constructor(handler: (cell: Coord<Geometry.CELL>) => void) {
        this._handler = handler;
    }

    move(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        const pos = click2svgCoord(event, svg);
        // Ensure the mouse is not in the margins of the grid.
        if (!isOnGrid(pos, grid)) return;

        // Interpolate if mouse jumped.
        if (null != this._prevPos && 1 < distSq(this._prevPos, pos)) {
            for (const coord of cellLine(this._prevPos, pos, grid)) {
                (this._handler)(coord);
            }
            this._prevPos = pos;
        }
        // Otherwise select the current cell.
        else {
            const coord = svgCoord2cellCoord(pos, grid, true);
            if (null != coord) {
                this._prevPos = pos;
                (this._handler)(coord)
            }
        }
    }

    reset(): void {
        this._prevPos = null;
    }

    leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        if (null != this._prevPos) {
            // Interpolate mouse jumps if needed.
            // Pos will be off-grid.
            const pos = click2svgCoord(event, svg);
            for (const coord of cellLine(this._prevPos, pos, grid)) {
                (this._handler)(coord);
            }
            this._prevPos = null;
        }
    }
}

export const mouseHandlers = (() => {
    enum State {
        NONE, // State when nothing has happened.
        SELECTING, // State when user begins selecting.
        DESELCTING, // State when user begins deselecting.
    }

    let state = State.NONE;
    // A cell that, if the click finishes, will trigger the special single-selected-cell deselect.
    let startClickCell: Idx<Geometry.CELL> | null = null;

    let prevPos: Coord<Geometry.SVG> | null = null;

    // Event order for a click is `mousedown` -> `mouseup` -> `click`.
    return {
        down(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            const pos = click2svgCoord(event, svg);
            const xy = svgCoord2cellCoord(pos, grid, false);
            if (null != xy) {
                prevPos = pos;

                const idx = cellCoord2CellIdx(xy, grid);
                if (event.shiftKey) {
                    // Shift: always select.
                    userState.ref('select', `${idx}`).replace(true);
                    state = State.SELECTING;
                }
                else if (event.ctrlKey || event.metaKey) {
                    // Ctrl: deselect if clicked cell is selected, otherwise select.
                    const selected = userState.get('select', `${idx}`);
                    userState.ref('select', `${idx}`).replace(!selected || null);
                    state = selected ? State.DESELCTING : State.SELECTING;
                }
                else if (event.altKey) {
                    // Alt: always deselect.
                    userState.ref('select', `${idx}`).replace(null);
                    state = State.DESELCTING;
                }
                else {
                    // No modifier: reset and select only this cell.
                    {
                        // Special handling for single-click toggle.
                        const select = userState.get<Record<string, true>>('select') || {};
                        if (1 === Object.keys(select).length && select[`${idx}`]) {
                            startClickCell = idx;
                        }
                    }
                    userState.ref('select').replace({ [`${idx}`]: true });
                    state = State.SELECTING;
                }
            }
        },
        move(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (State.NONE !== state) {
                startClickCell = null; // Not a click if the mouse moves.

                const pos = click2svgCoord(event, svg);
                if (!isOnGrid(pos, grid)) return;

                // Interpolate if mouse jumped.
                if (null != prevPos && 1 < distSq(prevPos, pos)) {
                    for (const coord of cellLine(prevPos, pos, grid)) {
                        const idx = cellCoord2CellIdx(coord, grid);
                        userState.ref('select', `${idx}`).replace(State.SELECTING === state || null);
                    }
                    prevPos = pos;
                }
                else {
                    // Select current cell.
                    const xy = svgCoord2cellCoord(pos, grid, true);
                    if (null != xy) {
                        prevPos = pos;
                        const idx = cellCoord2CellIdx(xy, grid);
                        userState.ref('select', `${idx}`).replace(State.SELECTING === state || null);
                    }
                }
            }
        },
        // Mouse up is on window to handle dragging mouse out of grid.
        up(_event: MouseEvent, _grid: Grid) {
            state = State.NONE;
            prevPos = null;
        },
        leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (State.NONE !== state && null != prevPos) {
                // Interpolate mouse jumps if needed.
                // Pos will be off-grid.
                const pos = click2svgCoord(event, svg);
                for (const coord of cellLine(prevPos, pos, grid)) {
                    const idx = cellCoord2CellIdx(coord, grid);
                    userState.ref('select', `${idx}`).replace(State.SELECTING === state || null);
                }
                prevPos = null;
            }
        },

        // For special single-selected-cell deselect click.
        click(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
            event.preventDefault();
            event.stopPropagation();

            if (null != startClickCell && !event.shiftKey && !(event.ctrlKey || event.metaKey) && !event.altKey) {
                const xy = svgCoord2cellCoord(click2svgCoord(event, svg), grid, false);
                if (null != xy) {
                    const idx = cellCoord2CellIdx(xy, grid);
                    if (idx === startClickCell) {
                        // Deselect the one selected cell, AKA just unselect all.
                        userState.ref('select').replace(null);
                        startClickCell = null;
                    }
                }
            }
        },
    };
})();
