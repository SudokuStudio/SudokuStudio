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

export type ConstraintDataAndComponent = {
    id: string,
    value: unknown,
    component: ConstraintComponent,
};

export const boardState = (window as any).boardState = new StateManager();

export type ConstraintComponent = typeof CONSTRAINT_COMPONENTS[keyof typeof CONSTRAINT_COMPONENTS];

export const CONSTRAINT_GLOBALS = {
    ['diagonal']: true,
    ['knight']: true,
    ['king']: true,
    ['disjointGroups']: true,
    ['consecutive']: true,

    ['given']: false,
    ['thermo']: false,
    ['arrow']: false,
    ['sandwich']: false,
} as const;

export const CONSTRAINT_COMPONENTS = {
    ['diagonal']: Diagonal,
    ['knight']: Knight,
    ['king']: King,
    ['disjointGroups']: DisjointGroups,
    ['consecutive']: Nonconsecutive,

    ['given']: Given,
    ['thermo']: Thermo,
    ['arrow']: Arrow,
    ['sandwich']: Sandwich,
} as const;

boardState.update({
    grid: {
        width: 9,
        height: 9,
    },
    constraints: {
        '10800': {
            type: 'diagonal',
            value: {
                positive: true,
                negative: false,
            },
            meta: {
                order: 0,
            },
        },
        '10090': {
            type: 'knight',
            value: false,
            meta: {
                order: 1,
            },
        },
        '10100': {
            type: 'king',
            value: false,
            meta: {
                order: 2,
            },
        },
        '10110': {
            type: 'disjointGroups',
            value: false,
            meta: {
                order: 3,
            },
        },
        '10120': {
            type: 'consecutive',
            value: false,
            meta: {
                order: 4,
            },
        },

        // LOCALS
        '10130': {
            type: 'given',
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