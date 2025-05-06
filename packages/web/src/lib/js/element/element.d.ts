import type { Geometry, IdxBitset, IdxMap } from '@sudoku-studio/schema';
import type { StateRef } from '@sudoku-studio/state-manager/src';
import type { InputHandler } from '$lib/js/input/inputHandler';

export interface AbstractMenuInfo {
    type: string;
    name: string;
    icon: string;
}
export interface SelectMenuInfo extends AbstractMenuInfo {
    type: 'select';
}
export type CheckboxInfo = { name: string; icon: string; refPath?: string };
export interface CheckboxMenuInfo extends AbstractMenuInfo {
    type: 'checkbox';
    checkbox: CheckboxInfo | Required<CheckboxInfo>[];
}
export type MenuInfo = SelectMenuInfo | CheckboxMenuInfo;

export type AbstractMenuProps = { id: string; elementRef: StateRef; info?: MenuInfo; deletable: boolean };

export type ElementInfo = {
    getInputHandler?: null | ((ref: StateRef, grid: Grid, svg: SVGSVGElement) => InputHandler);

    /** Render order. */
    order: number;
    /** If this element CANNOT be deleted. */
    permanent?: null | boolean;

    /** Can be unset if no menu component. */
    inGlobalMenu?: null | boolean;
    menu?: null | MenuInfo;

    getWarnings?:
        | null
        | ((
              value: unknown,
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
