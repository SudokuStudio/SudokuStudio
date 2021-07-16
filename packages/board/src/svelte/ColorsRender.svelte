<script lang="ts">
    import type { Geometry, IdxMap } from "@sudoku-studio/schema";
    import { makeConicalCellSlice } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    type Item = { idx: number, slices: { d: string, fill: string }[] };
    function getMarks(cells: IdxMap<Geometry.CELL, Record<string, boolean>>): Item[] {
        const out: Item[] = [];
        for (const [ idx, colorsBitset ] of Object.entries(cells)) {
            const colors = Object.keys(colorsBitset || {});
            colors.sort(); // TODO smarter ordering.

            const slices = colors.map((color, i, arr) => ({
                fill: color,
                d: makeConicalCellSlice(+idx, grid, i, arr.length),
            }));

            out.push({ idx: +idx, slices })
        }
        return out;
    }
</script>

<g {id}>
    {#each getMarks($ref || {}) as { idx, slices } (idx)}
        <g id="colors-{id}-{idx}">
            {#each slices as { d, fill }}
                <path {d} {fill} fill-opacity="0.6" stroke="none" />
            {/each}
        </g>
    {/each}
</g>
