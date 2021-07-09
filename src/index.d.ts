declare namespace schema {
    export interface Board {
        grid: Grid,
        constraints: Record<string, Element>,
    }

    export interface Grid {
        width: number,
        height: number,
    }

    export type ElementTypeIds = {
        // TODO (UNUSED).
          1: 'box',
        100: 'diagonal',
        120: 'knight',
        125: 'king',
        200: 'disjointGroups',
        300: 'consecutive',
    };
    export type ElementType = ElementTypeIds[keyof ElementTypeIds];

    export type Element = GridElement | BoxElement | BooleanElement | DigonalElement | KillerElement;

    interface AbstractElement {
        type: ElementType,
        order: number,
        value: unknown,
    }

    export interface GridElement extends AbstractElement {
        type: 'grid',
        value: null, // TODO?
    }
    export interface BoxElement extends AbstractElement {
        type: 'box',
        value: {
            width: boolean,
            height: boolean,
        },
    }
    export interface BooleanElement extends AbstractElement {
        type: 'knight' | 'king' | 'disjointGroups' | 'consecutive',
        value: {
            positive: boolean,
            negative: boolean,
        },
    }
    export interface DigonalElement extends AbstractElement {
        type: 'diagonal',
        value: {
            positive: boolean,
            negative: boolean,
        },
    }
    export interface KillerElement extends AbstractElement {
        type: 'killer',
        value: {
            [K: string]: {
                sum: number,
                cells: Record<string, true>,
            },
        },
    }
}
