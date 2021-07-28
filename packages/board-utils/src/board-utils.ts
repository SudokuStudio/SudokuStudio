import type { Grid, Idx, Coord, Geometry, ArrayObj, IdxMap, schema, IdxBitset } from "@sudoku-studio/schema";

// Annoying hack to cast to `any` because Svelte doesn't support TS inside the HTML templates.
export function any(x: any): any {
    return x;
}

export function solutionToString(solution: IdxMap<Geometry.CELL, number>, grid: Grid): string {
    const rows: string[] = [];
    for (let y = 0; y < grid.height; y++) {
        const row: string[] = [];
        for (let x = 0; x < grid.width; x++) {
            const idx = cellCoord2CellIdx([ x, y ], grid);
            row.push(`${solution[idx] || '_'}`);
        }
        rows.push(row.join(' '));
    }
    return rows.join('\n');
}

export const GRID_THICKNESS = 0.01;
export const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;

export const BOX_THICKNESS = 4 * GRID_THICKNESS;
export const BOX_THICKNESS_HALF = 0.5 * BOX_THICKNESS;


export function arrayObj2array<T>(arrayObj: ArrayObj<T>): T[] {
    const arr: T[] = [];
    for (let i = 0; null != arrayObj[i]; i++) {
        arr.push(arrayObj[i]);
    }
    return arr;
}


export function cellIdx2cellCoord(idx: Idx<Geometry.CELL>, { width }: Grid): Coord<Geometry.CELL> {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return [ x, y ];
}
export function cellCoord2CellIdx([ x, y ]: Coord<Geometry.CELL>, { width }: Grid): Idx<Geometry.CELL> {
    return y * width + x;
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


// Same as cell fns but with width increased by 1 b/c of the one extra fencepost.
export function cornerCoord2cornerIdx([ x, y ]: Coord<Geometry.CORNER>, { width }: Grid): Idx<Geometry.CORNER> {
    return y * (width + 1) + x;
}
export function cornerIdx2cornerCoord(vertId: Idx<Geometry.CORNER>, { width }: Grid): Coord<Geometry.CORNER> {
    const x = vertId % (width + 1);
    const y = Math.floor(vertId / (width + 1));
    return [ x, y ];
}
export function svgCoord2cornerCoord([ xf, yf ]: Coord<Geometry.SVG>, { width, height }: Grid): null | Coord<Geometry.CORNER> {
    const x = Math.round(xf);
    const y = Math.round(yf);
    if ((x < 0 || width < x) || (y < 0 || height < y)) return null;
    return [ x, y ];
}
export function cornerCoord2cellCoords([ cx, cy ]: Coord<Geometry.CORNER>, { width, height }: Grid): Coord<Geometry.CELL>[] {
    const out: Coord<Geometry.CELL>[] = [];
    for (let dy = -1; dy <= 0; dy++) {
        const y = cy + dy;
        if (y < 0 || height <= y) continue;

        for (let dx = -1; dx <= 0; dx++) {
            const x = cx + dx;
            if (x < 0 || width <= x) continue;

            out.push([ x, y ]);
        }
    }
    return out;
}


export function svgCoord2edgeIdx([ xf, yf ]: Coord<Geometry.SVG>, { width, height }: Grid): null | Idx<Geometry.EDGE> {
    const d = Math.abs(yf % 1 - 0.5) >= Math.abs(xf % 1 - 0.5);
    const w = width - (+!d);
    const h = height - (+d);
    const r = Math.floor(yf - 0.5 * (+ d));
    const c = Math.floor(xf - 0.5 * (+!d));
    if (c < 0 || w <= c) return null;
    if (r < 0 || h <= r) return null;
    return 2 * (w * r + c) + (+d);
}
export function edgeIdx2svgCoord(idx: Idx<Geometry.EDGE>, grid: Grid): Coord<Geometry.SVG> {
    const [ idx0, idx1 ] = edgeIdx2cellIdxes(idx, grid);
    const [ x0, y0 ] = cellIdx2cellCoord(idx0, grid);
    const [ x1, y1 ] = cellIdx2cellCoord(idx1, grid);
    return [ 0.5 * (x0 + x1 + 1), 0.5 * (y0 + y1 + 1) ];
}
export function edgeIdx2cellIdxes(idx: Idx<Geometry.EDGE>, grid: Grid): [ Idx<Geometry.CELL>, Idx<Geometry.CELL> ] {
    if (1 === idx % 2) {
        const cellIdx = 0.5 * (idx - 1);
        return [ cellIdx, cellIdx + grid.width ];
    }
    else {
        const cellIdx = 0.5 * idx + Math.floor(0.5 * idx / (grid.width - 1));
        return [ cellIdx, cellIdx + 1 ];
    }
}


export function svgCoord2seriesIdx([ xf, yf ]: Coord<Geometry.SVG>, { width, height }: Grid): null | Idx<Geometry.SERIES> {
    const isCol = yf < 0 || height <= yf;
    const isRow = xf < 0 || width <= xf;
    if (isCol === isRow) return null; // XOR.

    const z = Math.floor(isCol ? xf : yf);
    const w = 0 < (isCol ? yf : xf);
    // Most significant bits are the position (offset from top left).
    // Twos bit is col (0) or row (1).
    // Ones bit is top/left (0) or bottom/right (1).
    return (z << 2) | (+isRow << 1) | (+w);
}
export function seriesIdx2seriesCoord(idx: Idx<Geometry.SERIES>, { width, height }: Grid): Coord<Geometry.SERIES> {
    const z = idx >> 2;
    const w = 0b1 & idx;
    if (0b10 & idx) { // Row.
        return [ w * (1 + width) - 1, z ];
    }
    else { // Col.
        return [ z, w * (1 + height) - 1 ];
    }
}
/**
 * Returns the cell coordinates for a given series idx, starting from the adjacent cell.
 */
export function seriesIdx2CellCoords(idx: Idx<Geometry.SERIES>, { width, height }: Grid): Coord<Geometry.CELL>[] {
    const z = idx >> 2;
    const isRow = 0b1 & (idx >> 1);
    const dx = isRow;
    const dy = 1 - isRow;
    let x = z * dy;
    let y = z * dx;
    const out: Coord<Geometry.CELL>[] = [];
    while (x < width && y < height) {
        out.push([ x, y ]);
        x += dx;
        y += dy;
    }
    if (0b1 & idx) out.reverse();
    return out;
}


export function svgCoord2diagonalIdx([ xf, yf ]: Coord<Geometry.SVG>, grid: Grid): null | Idx<Geometry.DIAGONAL> {
    const { width, height } = grid;

    const left  = xf < 0;
    const right = width <= xf;
    const top   = yf < 0;
    const bot   = height <= yf;
    if (!left && !right && !top && !bot) return null;

    xf = Math.max(-0.5, Math.min(width,  xf));
    yf = Math.max(-0.5, Math.min(height, yf));
    // Positive or negative diagonal.
    const positive = 0b1 & (Math.floor(2 * xf) + Math.floor(2 * yf));

    let dir: number;
    if (top) {//yx
        dir = 0b00 | positive;
    }
    else if (bot) {
        dir = 0b10 | (1 - positive);
    }
    else if (left) {
        dir = positive << 1 | 0b0;
    }
    else { // right
        dir = (1 - positive) << 1 | 0b1;
    }

    const x = Math.floor(xf) + 1 - 2 * (0b01 & dir)
    const y = Math.floor(yf) + 1 -     (0b10 & dir);
    if (x < 0 || width <= x || y < 0 || height <= y) return null;

    if (top || bot)
        return (x << 2) | dir;
    else {
        return ((width + height - y - 1 - (0b1 & dir >> 1)) << 2) | dir;
    }
}
export function diagonalIdx2svgCoord(idx: Idx<Geometry.DIAGONAL>, { width, height }: Grid, offset: number = -0.75): Coord<Geometry.SVG> {
    const [ x, y ] = diagonalIdx2startingCellCoord(idx, { width, height });
    const dy = 1 - 2 * (0b1 & (idx >> 1));
    const dx = 1 - 2 * (0b1 & (idx >> 0));
    return [ 0.5 + x + offset * dx, 0.5 + y + offset * dy ];
}
export function diagonalIdx2dirVec(idx: Idx<Geometry.DIAGONAL>): [ -1 | 1, -1 | 1 ] {
    return [
        (0b01 & idx) ? -1 : 1,
        (0b10 & idx) ? -1 : 1,
    ];
}
export function diagonalIdx2startingCellCoord(idx: Idx<Geometry.DIAGONAL>, { width, height }: Grid): Coord<Geometry.CELL> {
    const z = idx >> 2;
    const b = 0b1 & (idx >> 1);
    const w = 0b1 & idx;
    if (z < width) {
        return [ z, b * (height - 1) ]
    }
    else {
        const y = z - width;
        return [ w * (width - 1), height - y - 1 - b ];
    }
}
export function diagonalIdx2diagonalCellCoords(idx: Idx<Geometry.DIAGONAL>, grid: Grid): Coord<Geometry.CELL>[] {
    let [ x, y ] = diagonalIdx2startingCellCoord(idx, grid);
    const [ dx, dy ] = diagonalIdx2dirVec(idx);

    const out: Coord<Geometry.CELL>[] = [];
    do {
        out.push([ x, y ]);
        x += dx;
        y += dy;
    } while (0 <= x && x < grid.width && 0 <= y && y < grid.height);
    return out;
}



export function idxMapToKeysArray<TAG extends Geometry>(map: null | undefined | IdxMap<TAG, any>): Idx<TAG>[] {
    if (null == map) return [];
    return Object.keys(map).filter(k => null != map[k] && false != map[k]).map(Number).sort((a, b) => a - b);
}

export function getMajorDiagonal(positive: boolean, grid: Grid): Coord<Geometry.CELL>[] {
    if (grid.width !== grid.height) throw Error(`No major diagonal exists for ${grid.height} rows by ${grid.width} cols grid.`);
    return Array(grid.width).fill(null)
        .map((_, i) => [ i, positive ? (grid.width - 1 - i) : i ]);
}

export function getRowCellIdxes(row: number, { width, height }: Grid): Idx<Geometry.CELL>[] {
    if (row < 0 || height <= row) throw Error(`ROW is outside grid: ${row}.`);
    return Array<void>(width).fill().map((_, i) => row * width + i);
}

export function getColCellIdxes(col: number, { width, height }: Grid): Idx<Geometry.CELL>[] {
    if (col < 0 || width <= col) throw Error(`COL is outside grid: ${col}.`);
    return Array<void>(height).fill().map((_, i) => col + i * width);
}

export function getBoxCellIdxes(bx: number, boxInfo: NonNullable<schema.BoxElement['value']>, grid: Grid): Idx<Geometry.CELL>[] {
    const out: Idx<Geometry.CELL>[] = [];

    const positions = boxInfo.width * boxInfo.height;
    for (let pos = 0; pos < positions; pos++) {
        const y = Math.floor(bx / boxInfo.width) * boxInfo.height + Math.floor(pos / boxInfo.width);
        const x = (bx % boxInfo.width) * boxInfo.height + (pos % boxInfo.width);
        out.push(cellCoord2CellIdx([ x, y ], grid));
    }
    return out;
}

export function writeRepeatingDigits(digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[], output: IdxBitset<Geometry.CELL>): void {
    const seen = new Map<number, Idx<Geometry.CELL>>();
    for (const cellIdx of cells) {
        const digit = digits[cellIdx];
        if (null == digit) continue;

        if (seen.has(digit)) {
            output[seen.get(digit)!] = true;
            output[cellIdx] = true;
        }
        else {
            seen.set(digit, cellIdx);
        }
    }
}

export function warnSum(digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[], warnings: IdxBitset<Geometry.CELL>, sum: number): boolean {
    let actualSum = 0;
    let allFilled = true;
    for (const cellIdx of cells) {
        const digit = digits[cellIdx];
        if (null == digit) {
            allFilled = false;
        }
        else {
            actualSum += digit;
        }
    }
    if (sum < actualSum || (allFilled && sum !== actualSum)) {
        cells.forEach(idx => warnings[idx] = true);
        return true;
    }
    return false;
}

export function warnClones(digits: IdxMap<Geometry.CELL, number>, cellsA: Idx<Geometry.CELL>[], cellsB: Idx<Geometry.CELL>[], warnings: IdxBitset<Geometry.CELL>): void {
    for (let i = 0; i < cellsA.length; i++) {
        const digitA = digits[cellsA[i]];
        const digitB = digits[cellsB[i]];

        if (null == digitA || null == digitB) continue;

        if (digitA !== digitB) {
            warnings[cellsA[i]] = true;
            warnings[cellsB[i]] = true;
        }
    }
}

export function markDigitsFailingCondition(
    digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[],
    output: IdxBitset<Geometry.CELL>, condition: (digit: number) => boolean): void
{
    for (const cellIdx of cells) {
        const digit = digits[cellIdx];
        if (null != digit && !condition(digit)) {
            output[cellIdx] = true;
        }
    }
}


export type MakePathOptions = {
    shortenHead?: number,
    shortenTail?: number,
    bezierRounding?: number,
};
export function makePath(idxArr: Idx<Geometry.CELL>[], grid: Grid, { shortenHead, shortenTail, bezierRounding }: MakePathOptions = {}): string {
    if (0 >= idxArr.length) return '';

    const points: [ number, number ][] = [];

    for (const idx of idxArr) {
        const [ x, y ] = cellIdx2cellCoord(idx, grid);
        points.push([ x + 0.5, y + 0.5 ]);
    }
    if (1 === points.length) points.push(points[0]); // Double up.

    if (shortenHead) {
        const vec = [
            points[1][0] - points[0][0],
            points[1][1] - points[0][1],
        ] as [ number, number ];
        normalize2d(vec);

        points[0][0] += vec[0] * shortenHead;
        points[0][1] += vec[1] * shortenHead;
    }
    if (shortenTail) {
        const len = points.length;
        const vec = [
            points[len - 2][0] - points[len - 1][0],
            points[len - 2][1] - points[len - 1][1],
        ] as [ number, number ];
        normalize2d(vec);

        points[len - 1][0] += vec[0] * shortenTail;
        points[len - 1][1] += vec[1] * shortenTail;
    }

    if (bezierRounding) {
        const out = [ 'M', points[0].join(',') ];
        for (let i = 2; i < points.length; i++) {
            const a = points[i - 2];
            const b = points[i - 1];
            const c = points[i];

            const ba = [ a[0] - b[0], a[1] - b[1] ] as [ number, number ];
            const bc = [ c[0] - b[0], c[1] - b[1] ] as [ number, number ];
            normalize2d(ba);
            normalize2d(bc);

            ba[0] *= bezierRounding;
            ba[1] *= bezierRounding;
            bc[0] *= bezierRounding;
            bc[1] *= bezierRounding;

            ba[0] += b[0];
            ba[1] += b[1];
            bc[0] += b[0];
            bc[1] += b[1];

            out.push('L', ba.join(','), 'Q', b.join(','), bc.join(','));
        }
        out.push('L', points[points.length - 1].join(','));

        return out.join(' ');
    }

    return 'M' + points.map(xy => xy.join(',')).join('L');
}

export function normalize2d(vec: [ number, number ]): void {
    const dist = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
    vec[0] /= dist;
    vec[1] /= dist;
}


export function click2svgCoord({ offsetX, offsetY }: { offsetX: number, offsetY: number }, board: SVGSVGElement): Coord<Geometry.SVG> {
    const { width: elWidth, height: elHeight } = board.getBoundingClientRect();
    const { x: originX, y: originY, width, height } = board.viewBox.baseVal;
    // if (offsetX < 0 || offsetY < 0) return null;
    const x = (width  * offsetX / elWidth  + originX);
    const y = (height * offsetY / elHeight + originY);
    return [ x, y ];
}

export function getOrthogonallyAdjacentCells([ x, y ]: Coord<Geometry.CELL>, { width, height }: Grid): Coord<Geometry.CELL>[] {
    const out: Coord<Geometry.CELL>[] = [];
    if (0 < x)
        out.push([ x - 1, y ]);
    if (0 < y)
        out.push([ x, y - 1 ]);
    if (x < width - 1)
        out.push([ x + 1, y ]);
    if (y < height - 1)
        out.push([ x, y + 1 ]);
    return out;
}

export function getBorderCellPairs(cellIdxes: Idx<Geometry.CELL>[], grid: Grid): [ Idx<Geometry.CELL>, Idx<Geometry.CELL> ][] {
    const in2out = new Map<Idx<Geometry.CELL>, Set<Idx<Geometry.CELL>>>();

    for (const cellIdx of cellIdxes) {
        const adjCellIdxes: Idx<Geometry.CELL>[] = getOrthogonallyAdjacentCells(cellIdx2cellCoord(cellIdx, grid), grid)
            .map(coord => cellCoord2CellIdx(coord, grid));

        const outsideAdj = new Set<Idx<Geometry.CELL>>();
        for (const adjCellIdx of adjCellIdxes) {
            if (in2out.has(adjCellIdx)) {
                in2out.get(adjCellIdx)!.delete(cellIdx);
            }
            else {
                outsideAdj.add(adjCellIdx);
            }
        }
        in2out.set(cellIdx, outsideAdj);
    }

    const out: [ Idx<Geometry.CELL>, Idx<Geometry.CELL> ][] = [];
    for (const [ inIdx, outIdxes ] of in2out) {
        for (const outIdx of outIdxes) {
            out.push([ inIdx, outIdx ]);
        }
    }
    return out;
}

export function getBorderAdjList(cellIdxes: Idx<Geometry.CELL>[], grid: Grid): Map<Idx<Geometry.CORNER>, Set<Idx<Geometry.CORNER>>> {
    // Adjacency table representing the directed graph created by the clockwise outline(s) of the selected cells.
    const adjList = new Map<Idx<Geometry.CORNER>, Set<Idx<Geometry.CORNER>>>();

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
    for (const idx of cellIdxes) {
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

    return adjList
}

/**
 * @param cellIdxes Cell indexes (0 to 80 for 9x9).
 * @param grid Grid width and height.
 * @param inset (Optional) Amount to inset the outline.
 * @returns SVG <path d="..." /> string.
 */
export function getBorderPath(cellIdxes: Idx<Geometry.CELL>[], grid: Grid, inset = 0): string | null {
    const adjList = getBorderAdjList(cellIdxes, grid);
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


export function cornerMarkPos(i: number, len: number): [ number, number ] {
    let dx: number, dy: number;
    if (len <= 4) {
        dx = (i % 2) * 0.6 - 0.3;
        dy = ((i / 2) | 0) * 0.6 - 0.3;
    }
    else {
        const half = (len / 2) | 0;
        if (i < half) {
            const d = 0.6 / (half - 1);
            dx = i * d - 0.3;
            dy = -0.3;
        }
        else {
            const d = 0.6 / (len - half - 1);
            dx = (i - half) * d - 0.3;
            dy = 0.3;
        }
    }
    return [ dx, dy ];
}

export const TWO_PI = 2 * Math.PI;

export function makeConicalCellSlice(idx: Idx<Geometry.CELL>, grid: Grid, index: number, slices: number, offsetFrac = 0.2): string {
    if (index >= slices) throw Error(`INDEX ${index} must be less than SLICES ${slices}.`);
    if (0 > index) throw Error(`INDEX ${index} must be positive`);

    const [ cx, cy ] = cellIdx2cellCoord(idx, grid);

    if (1 === slices) {
        return `M${cx},${cy}L${cx + 1},${cy}L${cx + 1},${cy + 1}L${cx},${cy + 1}Z`;
    }

    const headFrac = ((offsetFrac + index / slices) % 1 + 1) % 1;
    const tailFrac = ((offsetFrac + (index + 1) / slices) % 1 + 1) % 1;

    const fracs = [
        0.125,
        0.375,
        0.625,
        0.875,
    ];
    let s, e;
    for (s = 0; s < fracs.length && fracs[s] < headFrac; s++);
    for (e = 0; e < fracs.length && fracs[e] < tailFrac; e++);
    s %= fracs.length;
    e %= fracs.length;

    const selectedFracs: number[] = [ headFrac ];
    while (s !== e) {
        selectedFracs.push(fracs[s]);
        s++;
        s %= fracs.length;
    }
    selectedFracs.push(tailFrac);

    return `M${cx + 0.5},${cy + 0.5}L` +
        selectedFracs
            .map(frac => [ Math.cos(TWO_PI * frac), Math.sin(TWO_PI * frac) ])
            .map(([ x, y ]) => {
                const max = Math.max(Math.abs(x), Math.abs(y));
                return [ x / max, y / max ];
            })
            .map(([ x, y ]) => [ cx + 0.5 * (x + 1), cy + 0.5 * (y + 1) ])
            .map(([ x, y ]) => `${x},${y}`)
            .join('L') + 'Z';
}


export function getDigits(elements: schema.Board['elements'], includeGivens = true, includeFilled = true, includeZeros = false): IdxMap<Geometry.CELL, number> {
    const out: IdxMap<Geometry.CELL, number> = {};
    if (!includeGivens && !includeFilled) return out;

    for (const element of Object.values(elements)) {
        if (includeFilled && 'filled' === element.type) {
            Object.assign(out, element.value);
        }
    }

    // Ensure that givens occlude filled.
    for (const element of Object.values(elements)) {
        if ('givens' === element.type) {
            if (includeGivens) {
                Object.assign(out, element.value);
            }
            else {
                // Ensure occluded filled are ignored.
                for (const cellIdx of Object.keys(element.value || {})) {
                    delete out[cellIdx];
                }
            }
        }
    }

    if (!includeZeros) {
        for (const key of Object.keys(out)) {
            if (0 === out[key]) {
                delete out[key];
            }
        }
    }

    return out;
}


export const num2roman = (() => {
    // CC BY-SA 3.0.
    // This is a modified version of code by August.
    // https://stackoverflow.com/a/41358305/2398020
    const ROMAN_VALUES = [
        [ 'M',  1000 ],
        [ 'CM', 900 ],
        [ 'D',  500 ],
        [ 'CD', 400 ],
        [ 'C',  100 ],
        [ 'XC', 90 ],
        [ 'L',  50 ],
        [ 'XL', 40 ],
        [ 'X',  10 ],
        [ 'IX', 9 ],
        [ 'V',  5 ],
        [ 'IV', 4 ],
        [ 'I',  1 ],
    ] as const;
    return function num2roman(num: number): string {
        if (0 >= num) return `${num}`;
        let str = '';
        for (const [ c, v ] of ROMAN_VALUES) {
            var q = Math.floor(num / v);
            num -= q * v;
            str += c.repeat(q);
        }
        return str;
    }
})();

export const roman2num = (() => {
    // https://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    /*
    Copyright <YEAR> <COPYRIGHT HOLDER>

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
    */
    const validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
    const token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
    const key = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1} as const;
    return function deromanize(str: string): null | number {
        str = str.toUpperCase();
        let num = 0;
        let m: null | RegExpExecArray;
        if (!(str && validator.test(str)))
            return null;
        while (m = token.exec(str))
            num += key[m[0] as keyof typeof key];
        return num;
    }
})();

export function* product(...args: number[]): Generator<number[], void, void> {
    if (0 === args.length) {
        yield [];
    }
    else {
        for (let i = 0; i < args[0]; i++) {
            for (const x of product(...args.slice(1))) {
                x.unshift(i);
                yield x;
            }
        }
    }
}

export function *knightMoves({ width, height }: Grid): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void> {
    for (const [ y0, x0, y1, x1 ] of product(height, width, height, width)) {
        if (y0 >= y1) continue; // Don't double-count.
        const dy = Math.abs(y0 - y1);
        const dx = Math.abs(x0 - x1);
        if (3 !== dy + dx) continue;
        if (1 !== Math.abs(dy - dx)) continue;
        yield [
            [ x0, y0 ],
            [ x1, y1 ],
        ];
    }
}

export function* kingMoves({ width, height }: Grid): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void> {
    for (const [ y0, x0, y1, x1 ] of product(height, width, height, width)) {
        if (y0 >= y1) continue; // Don't double-count.
        const dy = Math.abs(y0 - y1);
        if (1 !== dy) continue;
        const dx = Math.abs(x0 - x1);
        if (1 !== dx) continue;

        yield [
            [ x0, y0 ],
            [ x1, y1 ],
        ];
    }
}
