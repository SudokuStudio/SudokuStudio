import type { Geometry, Grid, IdxBitset, IdxMap } from '@sudoku-studio/schema';
import type { Component } from 'svelte';
import type { InputHandler, InputHandlerContext } from './inputHandler.js';
import { type Data, StateRef } from '@sudoku-studio/state-manager/src';

export * as adjacentCellPointerHandler from './adjacentCellPointerHandler.js';
export * as inputHandler from './inputHandler.js';
export * as lineInputHandler from './lineInputHandler.js';

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

export type MenuComponent = SelectMenuComponent | CheckboxMenuComponent;

export type GetInputHandler<V extends Data> = (ctx: InputHandlerContext<V>) => InputHandler;

export type ElementComponentProps = { id: string; ref: StateRef<IdxBitset<Geometry.CELL>>; grid: Grid };

export type ElementInfo<V extends Data> = {
    // TODO(mingwei): Make this required.
    component?: Component<ElementComponentProps>;

    getInputHandler?: null | GetInputHandler<V>;

    /** Render order. */
    order: number;
    /** If this element CANNOT be deleted. */
    permanent?: null | boolean;

    /** Can be unset if no menu component. */
    inGlobalMenu?: null | boolean;
    menu?: null | MenuComponent;

    getWarnings?:
        | null
        | ((
              value: V,
              grid: Grid,
              regionMap: IdxMap<Geometry.CELL, number>,
              digits: IdxMap<Geometry.CELL, number>,
              warnings: IdxBitset<Geometry.CELL>,
          ) => void);

    /** Meta info, for seach. */
    meta?: null | {
        // TODO: Move icon and menu here.
        description: string;
        tags: string[];
        category: string[];
    };
};
