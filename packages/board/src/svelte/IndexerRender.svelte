<script lang="ts">
    import { idxMapToKeysArray } from "@sudoku-studio/board-utils";
    import { cellIdx2cellCoord } from "@sudoku-studio/board-utils";

    import type { Idx, Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
    export let color: string;

    const margin = 0.025;
    const stroke = 2 * margin;
    const size = 1 - stroke;

    type Item = { idx: Idx<Geometry.CELL>, x: number, y: number };
    function each(value: schema.RegionElement['value']): Item[] {
        const out: Item[] = [];
        for (const cellIdx of idxMapToKeysArray(value)) {
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
        <rect {x} {y} width={size} height={size} stroke={color} stroke-width={stroke} fill={color} fill-opacity="0.167" />
    {/each}
</g>
