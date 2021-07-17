import type { ElementInfo } from "./element";

export const diagonalInfo: ElementInfo = {
    inGlobalMenu: true,
    menu: {
        type: 'checkbox',
        name: 'Diagonals',
        checkbox: [
            {
                name: 'Positive Diagonal',
                icon: 'positive-diagonal',
                refPath: 'positive',
            },
            {
                name: 'Negative Diagonal',
                icon: 'negative-diagonal',
                refPath: 'negative',
            },
        ],
    },
};

export const disjointGroupsInfo: ElementInfo = {
    inGlobalMenu: true,
    menu: {
        type: 'checkbox',
        name: 'Disjoint Groups',
        checkbox: {
            name: 'Disjoint Groups',
            icon: 'disjoint',
        },
    },
};

export const consecutiveInfo: ElementInfo = {
    inGlobalMenu: true,
    menu: {
        type: 'checkbox',
        name: 'Nonconsecutive',
        checkbox: {
            name: 'Nonconsecutive',
            icon: 'nonconsecutive',
        },
    },
};

export const kingInfo: ElementInfo = {
    inGlobalMenu: true,
    menu: {
        type: 'checkbox',
        name: 'Antiking',
        checkbox: {
            name: 'Antiking',
            icon: 'king',
        },
    },
};

export const knightInfo: ElementInfo = {
    inGlobalMenu: true,
    menu: {
        type: 'checkbox',
        name: 'Antiknight',
        checkbox: {
            name: 'Antiknight',
            icon: 'knight',
        },
    },
};
