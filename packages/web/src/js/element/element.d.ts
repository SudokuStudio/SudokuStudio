import type { SvelteComponent } from "svelte";
import type { Geometry, Idx, IdxBitset, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { PointerHandler } from "./pointerHandler";
import type { InputHandler } from "../input/inputHandler";

export interface AbstractMenuComponent {
    type: string;
    name: string;
}
export interface SelectMenuComponent extends AbstractMenuComponent {
    type: 'select';
    icon: string;
}

export type CheckboxInfo = {
    name: string,
    icon: string,
    refPath?: string,
};
export interface CheckboxMenuComponent extends AbstractMenuComponent {
    type: 'checkbox';
    checkbox: CheckboxInfo | Required<CheckboxInfo>[];
}

export type MenuComponent = SelectMenuComponent | CheckboxMenuComponent;


export type ElementInfo = {
    getInputHandler?: null | ((ref: StateRef, grid: Grid, svg: SVGSVGElement) => InputHandler);

    /** Render order. */
    order: number,
    /** If this element CANNOT be deleted. */
    permanent?: null | boolean,

    /** Can be unset if no menu component. */
    inGlobalMenu?: null | boolean,
    menu?: null | MenuComponent;
};
