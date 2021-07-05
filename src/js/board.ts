import { writable } from 'svelte/store';

import * as schema from './board_schema';
import { StateManager } from './state_manager';

import type { Args as ConstraintRowArgs } from '../svelte/ConstraintRow.svelte';
// import type { Args } from "../svelte/ConstraintRow.svelte";


export const boardState = new StateManager();
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
    },
});

boardState.watch(([ _constraints, constraintId ], oldVal, newVal) => {
    if (null == oldVal) {
        // Add
    }
    else if (null == newVal) {
        // Remove
    }
    else {
        // Change
    }
}, true, 'constraints/*');


const CONSTRAINT_NAMES: Record<schema.ConstraintType, string> = {
    [schema.ConstraintType.DIAGONAL]: 'Diagonals',
    [schema.ConstraintType.KNIGHT]: 'Anti-Knight',
    [schema.ConstraintType.KING]: 'Anti-King',
    [schema.ConstraintType.DISJOINT_GROUPS]: 'Disjoint Groups',
    [schema.ConstraintType.CONSECUTIVE]: 'Nonconsecutive',
};

function handleGlobalConstraint(constraint: schema.Constraint): ConstraintRowArgs {
    switch (constraint.type) {
        case schema.ConstraintType.DIAGONAL:
            return {
                name: 'Diagonals',
                toggles: [
                    {
                        id: 'positive',
                        name: 'Positive Diagonal',
                        icon: 'positive-diagonal',
                        value: constraint.value.positive,
                    },
                    {
                        id: 'negative',
                        name: 'Negative Diagonal',
                        icon: 'negative-diagonal',
                        value: constraint.value.negative,
                    },
                ],
            };
        case schema.ConstraintType.KNIGHT:
            return {
                name: 'Anti-Knight',
                toggles: [
                    {
                        id: 'value',
                        name: 'Anti-Knight',
                        icon: 'positive-diagonal',
                        value: constraint.value.positive,
                    },
                ],
            };
        default: throw Error(`Unknown global constraint: ${constraint.type}.`);
    }
}


export const globalConstraints = writable([
    {
        id: "10080",
        name: 'Diagonals',
        icons: [ 'positive-diagonal', 'negative-diagonal' ],
        state: [ true, false ],
    },
    {
        id: "10090",
        name: 'Antiknight',
        icons: [ 'knight' ],
        state: [ false ],
    },
    {
        id: "10100",
        name: 'Antiking',
        icons: [ 'king' ],
        state: [ false ],
    },
    {
        id: "10090",
        name: 'Antiking',
        icons: [ 'king' ],
        state: [ false ],
    }
]);
