<script lang="ts">
    import type { Geometry, Idx, IdxMap } from "@sudoku-studio/schema";
    import { idxMapToKeysArray, cellIdx2cellCoord } from "@sudoku-studio/board-utils/src";
    import type { StateRef } from "@sudoku-studio/state-manager/src";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    function getMarks(cells: IdxMap<Geometry.CELL, Record<string, number>>): { idx: number, x: number, y: number, keys: Idx<Geometry.CELL>[], nums: Record<string, number>}[] {
        const out: { idx: number, x: number, y: number, keys: Idx<Geometry.CELL>[], nums: Record<string, number> }[] = [];
        for (const [ idx, nums ] of Object.entries(cells)) {
            const [ x, y ] = cellIdx2cellCoord(+idx, grid).map(x => x + 0.5);
            out.push({
                idx: +idx, x, y,
                keys: idxMapToKeysArray(nums),
                nums: nums || {}
            })
        }

        return out;
    }

    /// This function determines the color based on the count of numbers.
    /// `count` is a `true` when center marks are entered manually.
    /// Otherwise count is the number of solutions found for the cell.
    function color(count: number | true): string {
        if (count === true || count > 8) {
            return "#4e72b0"; // blue
        }
        if (count === 1) {
            return "#299b20"; // green
        }
        if (count <= 3) {
            return "#c4d0e4"; // lightest blue
        }
        // 3 < count <= 8
        return "#89a1ca"; // light blue
    }
</script>

<g {id} mask="url(#SUDOKU_MASK_GIVENS_FILLED)">
    {#each getMarks($ref || {}) as { idx, x, y, keys, nums } (idx)}
        <text {x} {y} text-anchor="middle" dominant-baseline="central" font-size="0.3" font-weight="600"
                textLength={keys.length > 5 ? '0.9' : undefined} lengthAdjust="spacingAndGlyphs">
            {#each keys as key}
                <tspan fill="{color(nums[key])}">{key}</tspan>
            {/each}
        </text>
    {/each}
</g>
