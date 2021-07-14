import type { SvelteComponent } from "svelte";
import type { Geometry, Idx, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { PointerHandler } from "../pointerHandler";

export type ViewBox = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export interface ElementHandlerClass<T extends ElementHandler, C extends SvelteComponent> {
    readonly TYPE: string;
    readonly IS_GLOBAL: boolean;
    readonly MenuComponent: null | SvelteComponentConstructor<C, any>;

    new (ref: StateRef, menuComponent: C): T;
}

export interface ElementHandler {
    readonly pointerHandler: null | PointerHandler;

    getViewBox(active: boolean): null | ViewBox;
    getConflicts(digits: IdxMap<Geometry.CELL, number>): Idx<Geometry.CELL>[];
}
