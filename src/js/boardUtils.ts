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
        function getAdj(vertId: number): Set<number> {
            let adj = adjList.get(vertId);
            if (null == adj) {
                adj = new Set();
                adjList.set(vertId, adj);
            }
            return adj;
        }

        const len = grid.width * grid.height;
        for (let idx = 0; idx < len; idx++) {
            if (true === idxBitset[idx]) {
                // A --> B
                // ^     |
                // |     V
                // D <-- C
                // For each cell.
                // For each each clockwise edge A->B
                // If the inverse edge B->A already exists, delete it.
                // Otherwise add the edge A->B.
                const { x, y } = idx2xy(idx, grid);
                const A = xy2vertId(    x,     y, grid);
                const B = xy2vertId(1 + x,     y, grid);
                const C = xy2vertId(1 + x, 1 + y, grid);
                const D = xy2vertId(    x, 1 + y, grid);
                if (getAdj(B).has(A)) getAdj(B).delete(A); else getAdj(A).add(B);
                if (getAdj(C).has(B)) getAdj(C).delete(B); else getAdj(B).add(C);
                if (getAdj(D).has(C)) getAdj(D).delete(C); else getAdj(C).add(D);
                if (getAdj(A).has(D)) getAdj(A).delete(D); else getAdj(D).add(A);
            }
        }
    }

    if (0 >= adjList.size) return null;

    const components: number[][] = [];
    while (1) {
        // Get a first vertex.
        let vertId = -1;
        for (const v of adjList.keys()) {
            if (0 < adjList.get(v)!.size) {
                vertId = v;
                break;
            }
        }
        // Exit if no more components.
        if (-1 === vertId)
            break;

        // Traverse the component.
        let verts = [ vertId ];
        while (1) {
            const adj = adjList.get(vertId)!;

            // Pick any edge to traverse and delete it from the graph.
            vertId = -1;
            for (vertId of adj) break;
            if (-1 === vertId) break;
            adj.delete(vertId);

            const start = verts.indexOf(vertId);
            // If we ever hit an existing vertex, splice that off as a separate component.
            if (0 <= start) components.push(verts.splice(start));
            // Otherwise keep extending this componenet.
            else verts.push(vertId);
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