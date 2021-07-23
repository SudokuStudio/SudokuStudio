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

    const EDGE: unique symbol;
    /** An inner edge (an edge between two cells). Only useful for Idx<EDGE>, Coord<EDGE> is not meaningful. */
    export type EDGE = typeof EDGE;

    const SERIES: unique symbol;
    /** A row or column, from the top or bottom, Coord<SERIES> will correspond to a point outside the grid. */
    export type SERIES = typeof SERIES;

    const DIAGONAL: unique symbol;
    /** A diagonal from outside the grid. */
    export type DIAGONAL = typeof DIAGONAL;

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
export type IdxBitset<TAG extends Geometry> = IdxMap<TAG, boolean>;
/** JS Object map from Idx<TAG> to any value. */
export type IdxMap<TAG extends Geometry, V> = {
    [K in Idx<TAG> as `${K}`]?: V;
};
export type ArrayObj<V> = {
    [K: number]: V;
};

/** Width and height of the grid. */
export type Grid = {
    width: number,
    height: number,
};

export declare namespace schema {
    export interface Board {
        grid: Grid,
        meta: Record<string, any>,
        elements: Record<string, Element>,
    }

    export interface Grid {
        width: number,
        height: number,
    }

    export type Element =
        GridElement | BoxElement | DigitElement | PencilMarksElement | ColorsElement
        | BooleanElement | ConsecutiveElement | DiagonalElement | KillerElement
        | KillerElement | CloneElement | QuadrupleElement | LineElement | ArrowElement
        | EdgeNumberElement | SeriesNumberElement | LittleKillerElement | RegionElement
        | TODO_ELEMENTS;
    export type ElementType = Element['type'];

    export interface AbstractElement {
        type: Element['type'],
        order: number,
        value?: unknown,
    }

    export interface GridElement extends AbstractElement {
        type: 'grid',
        value?: null,
    }
    export interface BoxElement extends AbstractElement {
        type: 'box',
        value?: {
            width: number,
            height: number,
        },
    }
    export interface DigitElement extends AbstractElement {
        type: 'givens' | 'filled',
        value?: IdxMap<Geometry.CELL, number>,
    }
    export interface PencilMarksElement extends AbstractElement {
        type: 'corner' | 'center',
        value?: IdxMap<Geometry.CELL, {
            [K: number]: true
        }>,
    }
    export interface ColorsElement extends AbstractElement {
        type: 'colors',
        value?: IdxMap<Geometry.CELL, {
            [K: string]: true
        }>,
    }

    export interface BooleanElement extends AbstractElement {
        type: 'knight' | 'king' | 'disjointGroups' | 'selfTaxicab',
        value?: {
            positive: boolean,
            negative: boolean,
        },
    }
    export interface ConsecutiveElement extends AbstractElement {
        type: 'consecutive',
        value?: {
            orth: boolean,
            diag: boolean,
        },
    }
    export interface DiagonalElement extends AbstractElement {
        type: 'diagonal',
        value?: {
            positive: boolean,
            negative: boolean,
        },
    }
    export interface KillerElement extends AbstractElement {
        type: 'killer',
        value?: {
            [K: string]: {
                sum?: number,
                cells: IdxBitset<Geometry.CELL>,
            },
        },
    }
    export interface CloneElement extends AbstractElement {
        type: 'clone',
        value?: {
            [K: string]: {
                label?: string,
                color?: string,
                a: ArrayObj<Idx<Geometry.CELL>>,
                b: ArrayObj<Idx<Geometry.CELL>>,
            },
        },
    }

    export interface QuadrupleElement extends AbstractElement {
        type: 'quadruple',
        value?: IdxMap<Geometry.CORNER, true | {
            0?: number,
            1?: number,
            2?: number,
            3?: number,
        }>,
    }
    export interface LineElement extends AbstractElement {
        type: 'thermo' | 'between' | 'palindrome' | 'whisper' | 'renban',
        value?: {
            [K: string]: ArrayObj<Idx<Geometry.CELL>>,
        },
    }
    export interface ArrowElement extends AbstractElement {
        type: 'arrow',
        value?: {
            [K: string]: {
                bulb: ArrayObj<Idx<Geometry.CELL>>,
                /** The first cell of the body is within the bulb and should not be considered for the sum. */
                body: ArrayObj<Idx<Geometry.CELL>>,
            },
        },
    }
    export interface EdgeNumberElement extends AbstractElement {
        type: 'difference' | 'ratio' | 'xv',
        value?: IdxMap<Geometry.EDGE, true | number>,
    }
    export interface SeriesNumberElement extends AbstractElement {
        type: 'sandwich' | 'xsums' | 'skyscraper',
        value?: IdxMap<Geometry.SERIES, true | number>,
    }
    export interface LittleKillerElement extends AbstractElement {
        type: 'littleKiller',
        value?: IdxMap<Geometry.DIAGONAL, true | number>,
    }

    export interface RegionElement extends AbstractElement {
        type: 'min' | 'max' | 'odd' | 'even',
        value?: IdxMap<Geometry.CELL, true>,
    }

    export interface TODO_ELEMENTS extends AbstractElement {
        type: never,
        value?: unknown,
    }
}

export interface Solver {
    cantAttempt(board: schema.Board): Promise<null | string>;
    solve(board: schema.Board, maxSolutions: number,
        onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): () => Promise<boolean>;
}
