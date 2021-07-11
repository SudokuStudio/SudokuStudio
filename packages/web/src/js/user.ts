import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord } from "@sudoku-studio/board-utils";
import type { Grid, Idx, Geometry } from "@sudoku-studio/schema";
import { StateManager } from "@sudoku-studio/state-manager";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {
    },
});

export const mouseHandlers = (() => {

    enum State {
        NONE, // State when nothing has happened.
        SELECTING, // State when user begins selecting.
        DESELCTING, // State when user begins deselecting.
    }

    let state = State.NONE;
    // A cell that, if the click finishes, will trigger the special single-selected-cell deselect.
    let startClickCell: Idx<Geometry.CELL> | null = null;

    // Event order for a click is `mousedown` -> `mouseup` -> `click`.
    return {
        down(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid) {
            event.preventDefault();
            event.stopPropagation();

            const xy = svgCoord2cellCoord(click2svgCoord(event, event.currentTarget), grid, false);
            if (null != xy) {
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
        move(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid) {
            event.preventDefault();
            event.stopPropagation();

            if (State.NONE !== state) {
                startClickCell = null; // Not a click if the mouse moves.
                const xy = svgCoord2cellCoord(click2svgCoord(event, event.currentTarget), grid, false);
                if (null != xy) {
                    const idx = cellCoord2CellIdx(xy, grid);
                    userState.ref('select', `${idx}`).replace(State.SELECTING === state || null);
                }
            }
        },
        // Mouse up is on window to handle dragging mouse out of grid.
        up(_event: MouseEvent & { currentTarget: EventTarget & Window }, _grid: Grid) {
            state = State.NONE;
        },

        // For special single-selected-cell deselect click.
        click(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid) {
            event.preventDefault();
            event.stopPropagation();

            if (null != startClickCell && !event.shiftKey && !(event.ctrlKey || event.metaKey) && !event.altKey) {
                const xy = svgCoord2cellCoord(click2svgCoord(event, event.currentTarget), grid, false);
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