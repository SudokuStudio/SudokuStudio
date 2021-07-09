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

export function getEdges(idxBitset: Record<string, true>, grid: { width: number, height: number }): string | null {
    const adjList = new Map<number, Set<number>>();

    {
        // A --> B
        // ^     |
        // |     V
        // D <-- C
        // For each cell.
        // For each each clockwise edge A->B
        // If the inverse edge B->A already exists, delete it.
        // Otherwise add the edge A->B.

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

        const len = grid.width * grid.height;
        for (let idx = 0; idx < len; idx++) {
            if (true === idxBitset[idx]) {
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
    }

    if (0 >= adjList.size) return null;

    const components: number[][] = [];
    while (1) {
        // Get a first vertex.
        let vertId = -1;
        for (vertId of adjList.keys()) break;
        // Exit if no more components.
        if (-1 === vertId)
            break;

        // Traverse the component.
        let verts = [ vertId ];
        while (1) {
            const adj = adjList.get(vertId)!;
            if (null == adj) break;

            // Pick any edge to traverse and delete it from the graph.
            let nextVertId = -1;
            for (nextVertId of adj) break;
            if (-1 === nextVertId) break;
            adj.delete(nextVertId);
            if (0 >= adj.size) adjList.delete(vertId);

            const start = verts.indexOf(nextVertId);
            // If we ever hit an existing vertex, splice that off as a separate component.
            if (0 <= start) components.push(verts.splice(start));
            // Otherwise keep extending this componenet.
            else verts.push(nextVertId);

            vertId = nextVertId;
        }
    }

    return components
        .map(component =>
            component.map(vertId => {
                const { x, y } = vertId2xy(vertId, grid);
                return `${x},${y}`;
            })
            .join('L')
        )
        .map(d => `M${d}Z`) // Each segment.
        .join('');
}