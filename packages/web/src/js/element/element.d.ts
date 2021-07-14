import type { SvelteComponent } from "svelte";
import type { Geometry, Idx, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { PointerHandler } from "./pointerHandler";

export type ViewBox = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export interface SvelteComponentConstructor<U, T> {
    new (options: U): T
};

export interface ElementHandlerClass<T extends ElementHandler> {
    new (ref: StateRef): T;
}

export interface ElementHandler {
    readonly isGlobal: boolean;
    readonly MenuComponent: null | SvelteComponentConstructor<C, any>;

    readonly pointerHandler: null | PointerHandler;
    // readonly inputHandler: null | Inputhandler;

    getViewBox(active: boolean, grid: Grid): null | ViewBox;
    getConflicts(digits: IdxMap<Geometry.CELL, number>, grid: Grid, output: Set<Idx<Geometry.CELL>>): void;
}
