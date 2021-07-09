import { svg2pixel, xy2idx } from "./boardUtils";
import { StateManager } from "./state_manager";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {
    },
});



function select(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: { width: number, height: number }, reset: boolean) {
    const { x, y } = svg2pixel(event, event.currentTarget);
    const idx = xy2idx({ x: Math.floor(x), y: Math.floor(y) }, grid);
    if (reset) userState.ref('select').replace(null);
    userState.ref('select', `${idx}`).replace(true);
}
let isSelecting = false;

export const mouseHandlers = {
    down(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: { width: number, height: number }) {
        isSelecting = true;
        select(event, grid, !event.shiftKey && !event.ctrlKey);
    },
    move(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: { width: number, height: number }) {
        if (isSelecting)
            select(event, grid, false);
    },
    // Mouse up is on window to handle dragging mouse out of grid.
    up(_event: MouseEvent & { currentTarget: EventTarget & Window }, _grid: { width: number, height: number }) {
        isSelecting = false;
    },
};
