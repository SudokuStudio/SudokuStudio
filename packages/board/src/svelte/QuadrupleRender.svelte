<script lang="ts">
    import { cornerIdx2cornerCoord } from "@sudoku-studio/board-utils";
    import type { Idx, Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const splitter = /.{1,2}/g;

    function each(value: schema.QuadrupleElement['value']): { idx: Idx<Geometry.CORNER>, x: number, y: number, lines: string[] }[] {
        const out: { idx: number, x: number, y: number, lines: string[] }[] = [];
        for (const [ cornerIdx, digits ] of Object.entries(value)) {
            const [ x, y ] = cornerIdx2cornerCoord(+cornerIdx, grid);
            const digitStr = Array.from(digits as ArrayLike<number>).join('');
            const lines = digitStr.match(splitter) || [];
            out.push({
                idx: +cornerIdx,
                x, y, lines,
            });
        }
        return out;
    }
    const fontSize = 0.20;
</script>

<g {id}>
    {#each each($ref) as { idx, x, y, lines } (idx)}
        <circle cx={x} cy={y} r="0.2125" fill="#fff" stroke="#000" stroke-width="0.02" />
        {#each lines as line, i}
            <text {x} y={y + fontSize * (i - 0.5 * (lines.length - 1))} text-anchor="middle" dominant-baseline="central" font-size={fontSize} font-weight="600">{line}</text>
        {/each}
    {/each}
</g>
