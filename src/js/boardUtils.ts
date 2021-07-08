export const GRID_THICKNESS = 0.01;
export const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;

export const BOX_THICKNESS = 4 * GRID_THICKNESS;
export const BOX_THICKNESS_HALF = 0.5 * BOX_THICKNESS;

export function any(x: any): any {
    return x;
}

export function idx2xy(idx: number, { width }: { width: number }): { x: number, y: number } {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return { x, y };
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
    return `M ${points.join(' L ')}`;
}
