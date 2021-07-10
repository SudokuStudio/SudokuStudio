import type { Grid } from "./units";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord } from "./boardUtils";
import { StateManager } from "./state_manager";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {
    },
});



function select(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid, reset: boolean, limitCircle: boolean) {
    const xy = svgCoord2cellCoord(click2svgCoord(event, event.currentTarget), grid, limitCircle);
    if (null == xy) return;
    const idx = cellCoord2CellIdx(xy, grid);
    if (reset) userState.ref('select').replace(null);
    userState.ref('select', `${idx}`).replace(true);
}
let isSelecting = false;

export const mouseHandlers = {
    down(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid) {
        isSelecting = true;
        select(event, grid, !event.shiftKey && !event.ctrlKey, false);
    },
    move(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: Grid) {
        if (isSelecting)
            select(event, grid, false, true);
    },
    // Mouse up is on window to handle dragging mouse out of grid.
    up(_event: MouseEvent & { currentTarget: EventTarget & Window }, _grid: Grid) {
        isSelecting = false;
    },
};
