<script lang="ts">
    import { bitsetToList } from "@sudoku-studio/board-utils";
    import { cellIdx2cellCoord } from "@sudoku-studio/board-utils";

    import type { Idx, Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    type Item = { idx: Idx<Geometry.CELL>, cx: number, cy: number };
    function each(value: schema.RegionElement['value']): Item[] {
        const out: Item[] = [];
        for (const cellIdx of bitsetToList(value)) {
            const [ x, y ] = cellIdx2cellCoord(cellIdx, grid);
            out.push({
                idx: +cellIdx,
                cx: x + 0.5,
                cy: y + 0.5,
            });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref || {}) as { idx, cx, cy } (idx)}
        <circle {cx} {cy} r="0.425" fill="#666" fill-opacity="0.267" />
    {/each}
</g>
