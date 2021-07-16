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
                refPath: 'nevative',
            },
        ],
    },
};
