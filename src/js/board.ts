import { StateManager } from './state_manager';

import Diagonal from '../svelte/edit/constraint/Diagonal.svelte';
import Knight from '../svelte/edit/constraint/Knight.svelte';
import King from '../svelte/edit/constraint/King.svelte';
import DisjointGroups from '../svelte/edit/constraint/DisjointGroups.svelte';
import Nonconsecutive from '../svelte/edit/constraint/Nonconsecutive.svelte';

export type ConstraintDataAndComponent = {
    id: string,
    value: unknown,
    component: ConstraintComponent,
};

export const boardState = (window as any).boardState = new StateManager();

export type ConstraintComponent = typeof CONSTRAINT_COMPONENTS[keyof typeof CONSTRAINT_COMPONENTS];
export const CONSTRAINT_COMPONENTS = {
    ['diagonal']: Diagonal,
    ['knight']: Knight,
    ['king']: King,
    ['disjointGroups']: DisjointGroups,
    ['consecutive']: Nonconsecutive,
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
        '10130': {
            type: 'givens',
            value: {
                "12": 3,
                "13": 4,
                "39": 4,
                "40": 1,
                "64": 3,
            }
        },
    },
});
