export const GRID_THICKNESS = 0.01;
export const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;

export const BOX_THICKNESS = 4 * GRID_THICKNESS;
export const BOX_THICKNESS_HALF = 0.5 * BOX_THICKNESS;

// Annoying that Svelte doesn't support TS inside the element templates.
export function any(x: any): any {
    return x;
}

export function idx2xy(idx: number, { width }: { width: number }): { x: number, y: number } {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return { x, y };
}
export function xy2idx({ x, y }: { x: number, y: number }, { width }: { width: number }): number {
    return y * width + x;
}

export function makePath(idxArr: Record<string, number>, grid: { width: number }): string {
    const points: string[] = [];

    let i = 0;
    let idx;
    while (null != (idx = idxArr[i])) {
        const { x, y } = idx2xy(idx, grid);
        points.push(`${x + 0.5},${y + 0.5}`);
        i++;
    }
    if (1 === points.length) points.push(points[0]); // Double up.
    return `M ${points.join(' L ')}`;
}

export function xy2vertId(x: number, y: number, { width }: { width: number }): number {
    return y * (width + 1) + x;
}
export function vertId2xy(vertId: number, { width }: { width: number }): { x: number, y: number } {
    const x = vertId % (width + 1);
    const y = Math.floor(vertId / (width + 1));
    return { x, y };
}

export function getFirstCell(idxBitset: Record<string, boolean>, grid: { width: number, height: number }): null | { x: number, y: number } {
    const len = grid.width * grid.height;
    for (let idx = 0; idx < len; idx++) {
        if (idxBitset[idx])
            return idx2xy(idx, grid);
    }
    return null;
}

export function bitsetToList(bitset: null | undefined | Record<string, boolean>): number[] {
    if (null == bitset) return [];
    return Object.keys(bitset).filter(k => !!bitset[k]).map(Number);
}

export function svg2pixel({ offsetX, offsetY}: { offsetX: number, offsetY: number }, board: SVGSVGElement): { x: number, y: number } {
    const { width: elWidth, height: elHeight } = board.getBoundingClientRect();
    const { x: originX, y: originY, width, height } = board.viewBox.baseVal;
    // if (offsetX < 0 || offsetY < 0) return null;
    const x = (width  * offsetX / elWidth  + originX);
    const y = (height * offsetY / elHeight + originY);
    return { x, y };
}

/**
 * @param cellIdxs Cell indexes (0 to 80 for 9x9).
 * @param grid
 * @param inset (Optional) Amount to inset the outline.
 * @returns Path "d" string.
 */
export function getEdges(cellIdxs: number[], grid: { width: number }, inset = 0): string | null {
    const adjList = new Map<number, Set<number>>();

    {
        // A --> B
        // ^     |
        // |     V
        // D <-- C
        // For each cell.
        // Consider each each clockwise edge A->B
        // If the inverse edge B->A already exists, delete that.
        // Otherwise create the edge A->B.

        function add(A: number, B: number): void {
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
            const { x, y } = idx2xy(idx, grid);
            const A = xy2vertId(    x,     y, grid);
            const B = xy2vertId(1 + x,     y, grid);
            const C = xy2vertId(1 + x, 1 + y, grid);
            const D = xy2vertId(    x, 1 + y, grid);
            add(A, B);
            add(B, C);
            add(C, D);
            add(D, A);
        }
    }

    if (0 >= adjList.size) return null;

    // Traverse each loop.
    const loops: string[] = [];
    while (1) {
        // Get a starting vertex that is not on a "touching corner".
        // (Do not delete this first edge, we need to hit it again to complete the loop for the triples.)
        if (0 >= adjList.size) break;
        const [ firstVertId, firstAdj ] = Array.from(adjList.entries()).find(([ _vertId, adj ]) => 1 === adj.size)!;
        let vertId = Array.from(firstAdj)[0];

        // Iterate in triples (a, b, c).
        let a = vertId2xy(firstVertId, grid);
        let b = vertId2xy(vertId, grid);

        const points: string[] = [];
        while (adjList.has(vertId)) {
            // Find all the next edges.
            const adj = adjList.get(vertId)!;

            // Pick the most-clockwise edge to traverse.
            let crossProd = Number.NEGATIVE_INFINITY;
            let nextVertId = -1;
            let c = null;
            for (const aVertId of adj) {
                const aC = vertId2xy(aVertId, grid);
                const aCrossProd = (b.x - a.x) * (aC.y - b.y) - (b.y - a.y) * (aC.x - b.x);
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
                let { x, y } = b;
                y += inset * (b.x - a.x) + crossProd * inset * (a.y - b.y);
                x += inset * (b.y - c.y) + crossProd * inset * (c.x - b.x);
                points.push(`${x},${y}`);
            }

            // Rotate vars.
            a = b;
            b = c;
            vertId = nextVertId;
        }
        loops.push('M' + points.join('L') + 'Z');
    }
    return loops.join('');
}