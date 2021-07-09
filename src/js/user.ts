import { svg2pixel, xy2idx } from "./boardUtils";
import { StateManager } from "./state_manager";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {
    },
});

export function boardOnClick(event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: { width: number, height: number }) {
    const { x, y } = svg2pixel(event, event.currentTarget);
    console.log(x, y);
    const idx = xy2idx({ x: Math.floor(x), y: Math.floor(y) }, grid);
    const ref = userState.ref('select', `${idx}`);
    ref.replace(!ref.get());
}
