<script lang="ts">
    import type { Geometry, IdxMap } from "@sudoku-studio/schema";
    import { bitsetToList, cellIdx2cellCoord, cornerMarkPos } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    function getMarks(cells: IdxMap<Geometry.CELL, Record<string, boolean>>): { idx: number, nums: { x: number, y: number, num: number }[] }[] {
        const out: { idx: number, nums: { x: number, y: number, num: number }[] }[] = [];
        for (const [ idx, numsBitset ] of Object.entries(cells)) {
            const x = cellIdx2cellCoord(+idx, grid)[0] + 0.5;
            const y = cellIdx2cellCoord(+idx, grid)[1] + 0.5;
            const nums = bitsetToList(numsBitset).map((num, i, arr) => {
                const [ dx, dy ] = cornerMarkPos(i, arr.length)
                return {
                    x: x + dx,
                    y: y + dy,
                    num,
                };
            });
            out.push({ idx: +idx, nums });
        }
        return out;
    }
</script>

<g {id} mask="url(#SUDOKU_MASK_GIVENS_FILLED)">
    {#each getMarks($ref || {}) as { idx, nums } (idx)}
        {#each nums as { x, y, num }}
            <text {x} {y} fill="#4e72b0" text-anchor="middle" dominant-baseline="central" font-size="0.3" font-weight="600">
                {num}
            </text>
        {/each}
    {/each}
</g>
