<script lang="ts">
    import { getBorderPath, cellIdx2cellCoord, arrayObj2array } from "@sudoku-studio/board-utils";
    import type { schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const inset = 0.05;
    const fontSize = 0.2;
    const strokeWidth = 0.03;

    type Item = { cloneAbId: string, label: string, labelPos: { x: number, y: number }, d: string, color: string };
    function each(value: schema.CloneElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ cloneId, { label, color, a, b } ] of Object.entries(value)) {
            for (let i = 0; i < 2; i++) {
                const cells = [ a, b ][i];
                if (null == cells) continue;
                const cellsArr = arrayObj2array(cells);
                cellsArr.sort((a, b) => a - b);
                if (0 >= cellsArr.length) continue;
                const lastIdx = cellsArr[cellsArr.length - 1];
                const d = getBorderPath(cellsArr, grid, inset);
                if (null == d) continue;
                const lastCoord = cellIdx2cellCoord(lastIdx, grid);
                const labelPos = {
                    x: lastCoord[0] + 1 - inset - strokeWidth,
                    y: lastCoord[1] + 1 - inset - strokeWidth,
                };
                const cloneAbId = `${cloneId}_${i}`;
                out.push({
                    cloneAbId, labelPos, d,
                    label: label || '',
                    color: color || '#222',
                });
            }
        }
        return out;
    }
</script>


<g {id}>
    {#each each($ref || {}) as { cloneAbId, label, labelPos, d, color } (cloneAbId)}
        <path {d} fill="none" stroke={color} stroke-width={strokeWidth} mask="url(#clone-{id}-mask)" />
        <text x={labelPos.x} y={labelPos.y} text-anchor="end" dominant-baseline="auto" fill={color} font-size={fontSize} font-weight="800">{label}</text>
    {/each}
</g>
