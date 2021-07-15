import type { SvelteComponent } from "svelte";
import type { Geometry, Idx, IdxBitset, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { PointerHandler } from "./pointerHandler";
import type { InputHandler } from "../input/inputHandler";

export type ViewBox = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export type ElementInfo = {
    getInputHandler?: null | ((ref: StateRef, grid: Grid, svg: SVGSVGElement) => InputHandler);

    /** Can be unset if no menu component. */
    inGlobalMenu?: null | boolean,
    // TODO: use pre-build menu components for most/all elements.
    menuComponent?: null | { new (options: any): SvelteComponent },
};
