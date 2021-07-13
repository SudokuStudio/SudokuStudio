import type { Grid, Idx, Coord, IdxBitset, Geometry } from "@sudoku-studio/schema";

// Annoying hack to cast to `any` because Svelte doesn't support TS inside the HTML templates.
export function any(x: any): any {
    return x;
}

export const GRID_THICKNESS = 0.01;
export const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;

export const BOX_THICKNESS = 4 * GRID_THICKNESS;
export const BOX_THICKNESS_HALF = 0.5 * BOX_THICKNESS;

export function cellIdx2cellCoord(idx: Idx<Geometry.CELL>, { width }: Grid): Coord<Geometry.CELL> {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return [ x, y ];
}
export function cellCoord2CellIdx([ x, y ]: Coord<Geometry.CELL>, { width }: Grid): Idx<Geometry.CELL> {
    return y * width + x;
}

// Same as cell fns but with width increased by 1 b/c of the one extra fencepost.
export function cornerCoord2cornerIdx([ x, y ]: Coord<Geometry.CORNER>, { width }: Grid): Idx<Geometry.CORNER> {
    return y * (width + 1) + x;
}
export function cornerIdx2cornerCoord(vertId: Idx<Geometry.CORNER>, { width }: Grid): Coord<Geometry.CORNER> {
    const x = vertId % (width + 1);
    const y = Math.floor(vertId / (width + 1));
    return [ x, y ];
}

/**
 * Get the CELL coordinates from SVG coordinates.
 * @param param0 SVG coordinates.
 * @param param1 Grid size.
 * @param conservative If true only count clicks within a center area of the cell. Used to make diagonals of cells easier to select.
 * @returns The CELL coordinates, or null if the click was outside the grid or outside the circle when limitCircle is true.
 */
export function svgCoord2cellCoord([ xf, yf ]: Coord<Geometry.SVG>, { width, height }: Grid, conservative: boolean): null | Coord<Geometry.CELL> {
    // Check coord is inside grid.
    if ((xf < 0 || width <= xf) || (yf < 0 || height <= yf)) return null;

    if (conservative) {
      const xr = xf % 1 - 0.5;
      const yr = yf % 1 - 0.5;
      if (0.5 < Math.abs(xr) + Math.abs(yr)) return null;
    }

    return [ Math.floor(xf), Math.floor(yf) ];
}


// Bitset functions.
export function getFirstFromBitset<TAG extends Geometry>(idxBitset: IdxBitset<TAG>, grid: Grid): null | Idx<TAG> {
    const len = grid.width * grid.height;
    for (let idx: Idx<TAG> = 0; idx < len; idx++) {
        if (idxBitset[idx]) return idx;
    }
    return null;
}
export function bitsetToList<TAG extends Geometry>(bitset: null | undefined | IdxBitset<TAG>): Idx<TAG>[] {
    if (null == bitset) return [];
    return Object.keys(bitset).filter(k => !!bitset[k]).map(Number);
}


export function makePath(idxArr: Record<string, Idx<Geometry.CELL>>, grid: Grid, shortenEnd: number = 0): string {
    const points: [ number, number ][] = [];

    let i = 0;
    let idx;
    while (null != (idx = idxArr[i])) {
        const [ x, y ] = cellIdx2cellCoord(idx, grid);
        points.push([ x + 0.5, y + 0.5 ]);
        i++;
    }
    if (1 === points.length) points.push(points[0]); // Double up.

    if (0 < shortenEnd) {
        const len = points.length;
        const dx = points[len - 1][0] - points[len - 2][0];
        const dy = points[len - 1][1] - points[len - 2][1];
        points[len - 1][0] += -dx * shortenEnd;
        points[len - 1][1] += -dy * shortenEnd;
    }

    return 'M' + points.map(xy => xy.join(',')).join('L');
}


export function click2svgCoord({ offsetX, offsetY }: { offsetX: number, offsetY: number }, board: SVGSVGElement): Coord<Geometry.SVG> {
    const { width: elWidth, height: elHeight } = board.getBoundingClientRect();
    const { x: originX, y: originY, width, height } = board.viewBox.baseVal;
    // if (offsetX < 0 || offsetY < 0) return null;
    const x = (width  * offsetX / elWidth  + originX);
    const y = (height * offsetY / elHeight + originY);
    return [ x, y ];
}

/**
 * @param cellIdxs Cell indexes (0 to 80 for 9x9).
 * @param grid Grid width and height.
 * @param inset (Optional) Amount to inset the outline.
 * @returns SVG <path d="..." /> string.
 */
export function getEdges(cellIdxs: Idx<Geometry.CELL>[], grid: Grid, inset = 0): string | null {

    // Adjacency table representing the directed graph created by the clockwise outline(s) of the selected cells.
    const adjList = new Map<Idx<Geometry.CORNER>, Set<Idx<Geometry.CORNER>>>();

    {
        // A --> B
        // ^     |
        // |     V
        // D <-- C
        // For each cell.
        // Consider each each clockwise edge A->B
        // If the inverse edge B->A already exists, delete that.
        // Otherwise create the edge A->B.

        function add(A: Idx<Geometry.CORNER>, B: Idx<Geometry.CORNER>): void {
            const adjBack = adjList.get(B);
            if (adjBack?.has(A)) {
                adjBack.delete(A);
                if (0 >= adjBack.size) adjList.delete(B);
            }
            else {
                let adj = adjList.get(A);
                if (null == adj) {
                    adj = new Set();
                    adjList.set(A, adj);
                }
                adj.add(B);
            }
        }
        for (const idx of cellIdxs) {
            const [ x, y ] = cellIdx2cellCoord(idx, grid);
            const A = cornerCoord2cornerIdx([     x,     y ], grid);
            const B = cornerCoord2cornerIdx([ 1 + x,     y ], grid);
            const C = cornerCoord2cornerIdx([ 1 + x, 1 + y ], grid);
            const D = cornerCoord2cornerIdx([     x, 1 + y ], grid);
            add(A, B);
            add(B, C);
            add(C, D);
            add(D, A);
        }
    }

    if (0 >= adjList.size) return null;


    // Traverse each region (may be multiple disconnected regions).
    const loops: string[] = [];
    while (1) {
        // Get a starting vertex that is not on or in front of a "touching corner".
        // (Do not delete this first edge, we need to hit it again to complete the loop for the triples.)
        if (0 >= adjList.size) break;
        const [ firstVertId, firstAdj ] = Array.from(adjList.entries()).find(([ _vertId, adj ]) => 1 === adj.size)!;
        const secondVertId = Array.from(firstAdj)[0];

        // Iterate in triples (a, b, c).
        let a = cornerIdx2cornerCoord(firstVertId, grid);
        let b = cornerIdx2cornerCoord(secondVertId, grid);
        let vertId = secondVertId;

        const points: string[] = [];
        do {
            // Find all the next edges.
            const adj = adjList.get(vertId)!;

            // Pick the most-clockwise edge to traverse.
            let crossProd = Number.NEGATIVE_INFINITY;
            let nextVertId = -1;
            let c = null;
            for (const aVertId of adj) {
                const aC = cornerIdx2cornerCoord(aVertId, grid);
                const aCrossProd = (b[0] - a[0]) * (aC[1] - b[1]) - (b[1] - a[1]) * (aC[0] - b[0]);
                if (crossProd < aCrossProd) {
                    crossProd = aCrossProd;
                    nextVertId = aVertId;
                    c = aC;
                }
            }
            if (null == c) throw "UNREACHABLE";
            adj.delete(nextVertId);
            if (0 >= adj.size) adjList.delete(vertId);

            // Calculate insets, push to list.
            if (0 !== crossProd) {
                let [ x, y ] = b;
                y += inset * (b[0] - a[0]) + crossProd * inset * (a[1] - b[1]);
                x += inset * (b[1] - c[1]) + crossProd * inset * (c[0] - b[0]);
                points.push(`${x},${y}`);
            }

            // Rotate vars.
            a = b;
            b = c;
            vertId = nextVertId;
        } while (secondVertId !== vertId);

        loops.push('M' + points.join('L') + 'Z');
    }
    return loops.join('');
}

export function isOnGrid(coord: Coord<Geometry.SVG>, grid: Grid): boolean {
    return 0 <= coord[0] && coord[0] < grid.width && 0 <= coord[1] && coord[1] < grid.height;
}

/**
 * Linear interpolation between to points, hitting all cells in-between.
 * @param start
 * @param end
 * @returns
 */
export function cellLine(a: Coord<Geometry.SVG>, b: Coord<Geometry.SVG>, grid: Grid): Coord<Geometry.CELL>[] {
    const rx = Math.floor(b[0]) - Math.floor(a[0]);
    const ry = Math.floor(b[1]) - Math.floor(a[1]);
    const range = Math.max(Math.abs(rx), Math.abs(ry));

    const out: Coord<Geometry.CELL>[] = [];
    for (let i = 1; i <= range; i++) {
        const lerp = i / range;
        const x = (1 - lerp) * a[0] + lerp * b[0];
        const y = (1 - lerp) * a[1] + lerp * b[1];

        if (0 <= x && x < grid.width && 0 <= y && y < grid.height)
            out.push([ Math.floor(x), Math.floor(y) ]);
    }
    return out;
}

export function distSq(a: Coord<Geometry.SVG>, b: Coord<Geometry.SVG>): number {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return dx * dx + dy * dy;
}