import { StateManager } from './state_manager';

import Diagonal from '../svelte/edit/constraint/Diagonal.svelte';
import Knight from '../svelte/edit/constraint/Knight.svelte';
import King from '../svelte/edit/constraint/King.svelte';
import DisjointGroups from '../svelte/edit/constraint/DisjointGroups.svelte';
import Nonconsecutive from '../svelte/edit/constraint/Nonconsecutive.svelte';
import Given from '../svelte/edit/constraint/Given.svelte';
import Thermo from '../svelte/edit/constraint/Thermo.svelte';
import Arrow from '../svelte/edit/constraint/Arrow.svelte';
import Sandwich from '../svelte/edit/constraint/Sandwich.svelte';

import BoxRender from '../svelte/board/constraint/BoxRender.svelte';
import GivenRender from '../svelte/board/constraint/GivenRender.svelte';
import ThermoRender from '../svelte/board/constraint/ThermoRender.svelte';

export type ConstraintDataAndComponent = {
    id: string,
    value: unknown,
    component: ConstraintComponent,
};

export const boardState = (window as any).boardState = new StateManager();


export enum ConstraintMenuType {
    GLOBAL,
    LOCAL,
    HIDDEN,
}

export const CONSTRAINT_MENU_TYPES = {
    ['box']: ConstraintMenuType.HIDDEN,

    ['given']: ConstraintMenuType.LOCAL,
    ['thermo']: ConstraintMenuType.LOCAL,
    ['arrow']: ConstraintMenuType.LOCAL,
    ['sandwich']: ConstraintMenuType.LOCAL,

    ['diagonal']: ConstraintMenuType.GLOBAL,
    ['knight']: ConstraintMenuType.GLOBAL,
    ['king']: ConstraintMenuType.GLOBAL,
    ['disjointGroups']: ConstraintMenuType.GLOBAL,
    ['consecutive']: ConstraintMenuType.GLOBAL,
} as const;

export type ConstraintComponent = NonNullable<typeof CONSTRAINT_COMPONENTS[keyof typeof CONSTRAINT_COMPONENTS]>;
export const CONSTRAINT_COMPONENTS = {
    ['box']: null,

    ['given']: Given,
    ['thermo']: Thermo,
    ['arrow']: Arrow,
    ['sandwich']: Sandwich,

    ['diagonal']: Diagonal,
    ['knight']: Knight,
    ['king']: King,
    ['disjointGroups']: DisjointGroups,
    ['consecutive']: Nonconsecutive,
} as const;

export type ConstraintRenderer = NonNullable<typeof CONSTRAINT_RENDERERS[keyof typeof CONSTRAINT_RENDERERS]>;
export const CONSTRAINT_RENDERERS = {
    ['box']: BoxRender,

    ['given']: GivenRender,
    ['thermo']: ThermoRender,
    ['arrow']: null,
    ['sandwich']: null,

    ['diagonal']: null,
    ['knight']: null,
    ['king']: null,
    ['disjointGroups']: null,
    ['consecutive']: null,
} as const;

boardState.update({
    grid: {
        width: 9,
        height: 9,
    },
    constraints: {
        '0': {
            type: 'box',
            order: 10,
            value: {
                width: 3,
                height: 3,
            },
        },
        '10800': {
            type: 'diagonal',
            value: {
                positive: true,
                negative: false,
            },
        },
        '10090': {
            type: 'knight',
            value: false,
        },
        '10100': {
            type: 'king',
            value: false,
        },
        '10110': {
            type: 'disjointGroups',
            value: false,
        },
        '10120': {
            type: 'consecutive',
            value: false,
        },

        // LOCALS
        '10130': {
            type: 'given',
            order: 15,
            value: {
                "12": 3,
                "13": 4,
                "39": 4,
                "40": 1,
                "64": 3,
            },
        },
        '10140': {
            type: 'thermo',
            order: 3,
            value: {
                "110": {
                    "0": "3",
                    "1": "13",
                    "2": "23",
                },
                "120": {
                    "0": "29",
                    "1": "20",
                    "2": "21",
                },
            },
        },
        '10150': {
            type: 'arrow',
            order: 9,
            value: {
                "110": {
                    "head": {
                        "0": "27",
                    },
                    "body": {
                        "0": "28",
                        "1": "29",
                    },
                },
            },
        },
    },
});