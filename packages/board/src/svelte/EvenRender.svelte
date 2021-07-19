<script lang="ts">
    import { bitsetToList } from "@sudoku-studio/board-utils";
    import { cellIdx2cellCoord } from "@sudoku-studio/board-utils";

    import type { Idx, Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const margin = 0.125;
    const size = 1 - 2 * margin;

    type Item = { idx: Idx<Geometry.CELL>, x: number, y: number };
    function each(value: schema.RegionElement['value']): Item[] {
        const out: Item[] = [];
        for (const cellIdx of bitsetToList(value)) {
            const [ x, y ] = cellIdx2cellCoord(cellIdx, grid);
            out.push({
                idx: +cellIdx,
                x: x + margin,
                y: y + margin,
            });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref || {}) as { idx, x, y } (idx)}
        <rect {x} {y} width={size} height={size} fill="#666" fill-opacity="0.267" />
    {/each}
</g>
