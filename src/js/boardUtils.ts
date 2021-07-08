export const GRID_THICKNESS = 0.01;
export const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;

export const BOX_THICKNESS = 4 * GRID_THICKNESS;
export const BOX_THICKNESS_HALF = 0.5 * BOX_THICKNESS;

export function idx2xy(idx: number, { width }: { width: number }): { x: number, y: number } {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return { x, y };
}
