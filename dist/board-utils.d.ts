import type { Grid, Idx, Coord, Geometry, ArrayObj, IdxMap, schema, IdxBitset } from "@sudoku-studio/schema";
export * as boardRepr from "./board-repr.js";
export declare function solutionToString(solution: IdxMap<Geometry.CELL, number>, grid: Grid): string;
export declare const GRID_THICKNESS = 0.01;
export declare const GRID_THICKNESS_HALF: number;
export declare const GRID_REGION_THICKNESS: number;
export declare const GRID_REGION_THICKNESS_HALF: number;
export declare function arrayObj2array<T>(arrayObj: ArrayObj<T>): T[];
export declare function cellIdx2cellCoord(idx: Idx<Geometry.CELL>, { width }: Grid): Coord<Geometry.CELL>;
export declare function cellCoord2CellIdx([x, y]: Coord<Geometry.CELL>, { width }: Grid): Idx<Geometry.CELL>;
/**
 * Get the CELL coordinates from SVG coordinates.
 * @param param0 SVG coordinates.
 * @param param1 Grid size.
 * @param conservative If true only count clicks within a center area of the cell. Used to make diagonals of cells easier to select.
 * @returns The CELL coordinates, or null if the click was outside the grid or outside the circle when limitCircle is true.
 */
export declare function svgCoord2cellCoord([xf, yf]: Coord<Geometry.SVG>, { width, height }: Grid, conservative: boolean): null | Coord<Geometry.CELL>;
export declare function cornerCoord2cornerIdx([x, y]: Coord<Geometry.CORNER>, { width }: Grid): Idx<Geometry.CORNER>;
export declare function cornerIdx2cornerCoord(vertId: Idx<Geometry.CORNER>, { width }: Grid): Coord<Geometry.CORNER>;
export declare function svgCoord2cornerCoord([xf, yf]: Coord<Geometry.SVG>, { width, height }: Grid): null | Coord<Geometry.CORNER>;
export declare function cornerCoord2cellCoords([cx, cy]: Coord<Geometry.CORNER>, { width, height }: Grid): Coord<Geometry.CELL>[];
export declare function svgCoord2edgeIdx([xf, yf]: Coord<Geometry.SVG>, { width, height }: Grid): null | Idx<Geometry.EDGE>;
export declare function edgeIdx2svgCoord(idx: Idx<Geometry.EDGE>, grid: Grid): Coord<Geometry.SVG>;
export declare function edgeIdx2cellIdxes(idx: Idx<Geometry.EDGE>, grid: Grid): [Idx<Geometry.CELL>, Idx<Geometry.CELL>];
export declare function svgCoord2seriesIdx([xf, yf]: Coord<Geometry.SVG>, { width, height }: Grid): null | Idx<Geometry.SERIES>;
export declare function seriesIdx2seriesCoord(idx: Idx<Geometry.SERIES>, { width, height }: Grid): Coord<Geometry.SERIES>;
/**
 * Returns the cell coordinates for a given series idx, starting from the adjacent cell.
 */
export declare function seriesIdx2CellCoords(idx: Idx<Geometry.SERIES>, { width, height }: Grid): Coord<Geometry.CELL>[];
export declare function svgCoord2diagonalIdx([xf, yf]: Coord<Geometry.SVG>, grid: Grid): null | Idx<Geometry.DIAGONAL>;
export declare function diagonalIdx2svgCoord(idx: Idx<Geometry.DIAGONAL>, { width, height }: Grid, offset?: number): Coord<Geometry.SVG>;
export declare function diagonalIdx2dirVec(idx: Idx<Geometry.DIAGONAL>): [-1 | 1, -1 | 1];
export declare function diagonalIdx2startingCellCoord(idx: Idx<Geometry.DIAGONAL>, { width, height }: Grid): Coord<Geometry.CELL>;
export declare function diagonalIdx2diagonalCellCoords(idx: Idx<Geometry.DIAGONAL>, grid: Grid): Coord<Geometry.CELL>[];
export declare function idxMapToKeysArray<TAG extends Geometry>(map: null | undefined | IdxMap<TAG, any>): Idx<TAG>[];
export declare function getMajorDiagonal(positive: boolean, grid: Grid): Coord<Geometry.CELL>[];
export declare function getRowCellIdxes(row: number, { width, height }: Grid): Idx<Geometry.CELL>[];
export declare function getColCellIdxes(col: number, { width, height }: Grid): Idx<Geometry.CELL>[];
export declare function writeRepeatingDigits(digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[], output: IdxBitset<Geometry.CELL>): void;
export declare function warnSum(digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[], warnings: IdxBitset<Geometry.CELL>, sum: number): boolean;
export declare function warnClones(digits: IdxMap<Geometry.CELL, number>, cellsA: Idx<Geometry.CELL>[], cellsB: Idx<Geometry.CELL>[], warnings: IdxBitset<Geometry.CELL>): void;
export declare function markDigitsFailingCondition(digits: IdxMap<Geometry.CELL, number>, cells: Idx<Geometry.CELL>[], output: IdxBitset<Geometry.CELL>, condition: (digit: number) => boolean): void;
export type MakePathOptions = {
    shortenHead?: number;
    shortenTail?: number;
    bezierRounding?: number;
    closeLoops?: boolean;
};
export declare function makePath(idxArr: Idx<Geometry.CELL>[], grid: Grid, { shortenHead, shortenTail, bezierRounding, closeLoops, }?: MakePathOptions): string;
export declare function normalize2d(vec: [number, number]): void;
export declare function click2svgCoord({ offsetX, offsetY }: {
    offsetX: number;
    offsetY: number;
}, board: SVGSVGElement): Coord<Geometry.SVG>;
export declare function getOrthogonallyAdjacentCells([x, y]: Coord<Geometry.CELL>, { width, height }: Grid): Coord<Geometry.CELL>[];
export declare function getBorderCellPairs(cellIdxes: Idx<Geometry.CELL>[], grid: Grid): [Idx<Geometry.CELL>, Idx<Geometry.CELL>][];
export declare function getBorderAdjList(cellIdxes: Idx<Geometry.CELL>[], grid: Grid): Map<Idx<Geometry.CORNER>, Set<Idx<Geometry.CORNER>>>;
/**
 * @param cellIdxes Cell indexes (0 to 80 for 9x9).
 * @param grid Grid width and height.
 * @param inset (Optional) Amount to inset the outline.
 * @returns SVG <path d="..." /> string.
 */
export declare function getBorderPath(cellIdxes: Idx<Geometry.CELL>[], grid: Grid, inset?: number, connectDiag?: boolean): string | null;
export declare function isOnGrid(coord: Coord<Geometry.SVG>, grid: Grid): boolean;
/**
 * Linear interpolation between to points, hitting all cells in-between.
 * @param start
 * @param end
 * @returns
 */
export declare function cellLine(a: Coord<Geometry.SVG>, b: Coord<Geometry.SVG>, grid: Grid): Coord<Geometry.CELL>[];
export declare function distSq(a: Coord<Geometry.SVG>, b: Coord<Geometry.SVG>): number;
export declare function cornerMarkPos(i: number, len: number): [number, number];
export declare const TWO_PI: number;
export declare function makeConicalCellSlice(idx: Idx<Geometry.CELL>, grid: Grid, index: number, slices: number, offsetFrac?: number): string;
export declare function getDigits(elements: schema.Board["elements"], includeGivens?: boolean, includeFilled?: boolean, includeZeros?: boolean): IdxMap<Geometry.CELL, number>;
export declare const num2roman: (num: number) => string;
export declare const roman2num: (str: string) => null | number;
export declare function product(...args: number[]): Generator<number[], void, void>;
export declare function knightMoves({ width, height, }: Grid): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void>;
export declare function kingMoves({ width, height, }: Grid): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void>;
export declare function getOrthogonallyAdjacentPairs({ width, height, }: Grid): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void>;
export declare const gridToBoxSizeMap: {
    readonly 3: readonly [3, 1];
    readonly 4: readonly [2, 2];
    readonly 5: readonly [5, 1];
    readonly 6: readonly [3, 2];
    readonly 7: readonly [7, 1];
    readonly 8: readonly [4, 2];
    readonly 9: readonly [3, 3];
    readonly 10: readonly [5, 2];
    readonly 11: readonly [11, 1];
    readonly 12: readonly [4, 3];
    readonly 13: readonly [13, 1];
    readonly 14: readonly [7, 2];
    readonly 15: readonly [5, 3];
    readonly 16: readonly [4, 4];
};
export declare function buildRegionMap(elements: schema.Board["elements"]): IdxMap<Geometry.CELL, number>;
//# sourceMappingURL=board-utils.d.ts.map