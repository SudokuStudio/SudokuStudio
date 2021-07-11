/*
 * Special helper types which let use tag `number`s and `[ number, number ]` coordinates
 * with the `Geometry` (i.e. CELL, cell CORNER, etc.) they represent.
 */

// Grid unit types to distinguish `number`s.
// `declare` creates the types without actually creating the variable values.
// `unique symbol` is a _generative_ type -- even though it looks like CELL and CORNER
// look like the same type, they are distinct and incompatible.
export declare module Geometry {
    const CELL: unique symbol;
    /** Grid cells -- where numbers go. */
    export type CELL = typeof CELL;

    const CORNER: unique symbol;
    /** Corners of the grid where four cells meet (or fewer if you're at an edge/corner of the board). */
    export type CORNER = typeof CORNER;

    const SVG: unique symbol;
    /** SVG unit space (only useful for Coord) - values can have decimals. */
    export type SVG = typeof SVG;
}
// Overload the type of Geometry to make it act like an enum.
// When treated as a value it acts like the module above.
// When treaded as a type it acts like the union of the types inside the module above.
export type Geometry = typeof Geometry[keyof typeof Geometry];

/** An 1d index for the given Geometry. */
export type Idx<TAG extends Geometry> = number & { _idx?: TAG };
/** 2d coordinates [ x, y ] for the given Geometry. */
export type Coord<TAG extends Geometry> = [ x: number, y: number ] & { _coord?: TAG }
/** JS Object map from Idx<TAG> to boolean flag representing set membership. */
export type IdxBitset<TAG extends Geometry> = {
    [K in Idx<TAG> as `${K}`]: boolean;
};

/** Width and height of the grid. */
export type Grid = {
    width: number,
    height: number,
};

export declare namespace schema {
    export interface Board {
        grid: Grid,
        constraints: Record<string, Element>,
    }

    export interface Grid {
        width: number,
        height: number,
    }

    export type Element = GridElement | BoxElement | BooleanElement | DigonalElement | KillerElement | KillerElement;

    export interface AbstractElement {
        type: Element['type'],
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
                cells: Record<string, boolean>,
            },
        },
    }
}
