<script lang="ts">
    import type { Geometry, Idx, IdxMap } from "@sudoku-studio/schema";
    import { bitsetToList, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    function getMarks(cells: IdxMap<Geometry.CELL, Record<string, boolean>>): { idx: number, x: number, y: number, nums: Idx<Geometry.CELL>[] }[] {
        const out: { idx: number, x: number, y: number, nums: Idx<Geometry.CELL>[] }[] = [];
        for (const [ idx, nums ] of Object.entries(cells)) {
            const [ x, y ] = cellIdx2cellCoord(+idx, grid).map(x => x + 0.5);
            out.push({
                idx: +idx, x, y,
                nums: bitsetToList(nums),
            })
        }

        return out;
    }
</script>

<g {id} mask="url(#SUDOKU_MASK_GIVENS_FILLED)">
    {#each getMarks($ref || {}) as { idx, x, y, nums } (idx)}
        <text {x} {y} fill="#4e72b0" text-anchor="middle" dominant-baseline="central" font-size="0.3" font-weight="600"
                textLength={nums.length > 5 ? '0.9' : undefined} lengthAdjust="spacingAndGlyphs">
            {nums.join('')}
        </text>
    {/each}
</g>
