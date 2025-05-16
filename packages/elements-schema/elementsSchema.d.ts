import type { Data, Diff, StateRef } from '@sudoku-studio/state-manager/src';
import type { Geometry, Grid, Idx, IdxBitset, IdxMap } from '@sudoku-studio/schema';
import type { Component } from 'svelte';

export type ElementInfo<V extends Data> = {
    component: Component<ElementComponentProps<V>>;
    /** Additional space needed on every side of the board to display the component. `0` if not specified. */
    margin?: null | number;

    getInputHandler?: null | GetInputHandler<V>;

    /**
     * Render & menu sort order.
     * TODO(mingwei): Separate these into two properties?
     */
    order: number;
    /** If this element CANNOT be deleted. */
    permanent?: null | boolean;

    /** Can be unset if no menu component. */
    inGlobalMenu?: null | boolean;
    menu?: null | MenuComponent;

    /** Get which cells directly violate the logical rules for this element. */
    getWarnings?: null | GetWarnings<V>;

    /** Meta info, for seach. */
    meta?: null | {
        // TODO: Move icon and menu here.
        description: string;
        tags: string[];
        category: string[];
    };
};

export type ElementComponentProps<V extends Data> = { id: string; ref: StateRef<V>; grid: Grid };

export type GetInputHandler<V extends Data> = (ctx: InputHandlerContext<V>) => InputHandler;

export interface InputHandlerContext<V extends Data> {
    stateRef: StateRef<V>;
    grid: Grid;
    svg: SVGSVGElement;
    pushHistory: (diff: Diff | null) => boolean;
    getCellValue: (markType: string, cellIndex: Idx<Geometry.CELL>) => Data;
    clearUserSelection: () => void;
}

export interface InputHandler {
    load(): void;
    unload(): void;

    blur(event: FocusEvent): void;

    keydown(event: KeyboardEvent): void;
    keyup(event: KeyboardEvent): void;
    padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void;

    mouseDown(event: MouseEvent): void;
    mouseMove(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
    leave(event: MouseEvent): void;
    click(event: MouseEvent): void;

    touchDown(event: TouchEvent): void;
    touchMove(event: TouchEvent): void;
    touchUp(event: TouchEvent): void;
}

export type MenuComponent = SelectMenuComponent | CheckboxMenuComponent;

export interface AbstractMenuComponent {
    type: string;
    name: string;
    icon: string;
}
export interface SelectMenuComponent extends AbstractMenuComponent {
    type: 'select';
}

export type CheckboxInfo = { name: string; icon: string; refPath?: string };
export interface CheckboxMenuComponent extends AbstractMenuComponent {
    type: 'checkbox';
    checkbox: CheckboxInfo | Required<CheckboxInfo>[];
}

/**
 * An element should mark cells in `warnings` as `true` if the values directly violate their rules.
 * More complex rules requiring logical steps should not induce warnings.
 */
export type GetWarnings<V> = (
    value: V | undefined,
    grid: Grid,
    regionMap: IdxMap<Geometry.CELL, number>,
    digits: IdxMap<Geometry.CELL, number>,
    warnings: IdxBitset<Geometry.CELL>,
) => void;
