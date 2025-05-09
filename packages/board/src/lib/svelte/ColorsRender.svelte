<script lang="ts">
    import type { Geometry, Grid, IdxMap, schema } from '@sudoku-studio/schema';
    import { makeConicalCellSlice } from '@sudoku-studio/board-utils/src';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import hsluv from 'hsluv';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.ColorsElement['value']>; grid: Grid } = $props();

    type Item = { idx: number; slices: { d: string; fill: string }[] };
    function getMarks(cells: IdxMap<Geometry.CELL, Record<string, boolean>>): Item[] {
        const out: Item[] = [];
        for (const [idx, colorsBitset] of Object.entries(cells)) {
            const colors = Object.keys(colorsBitset || {});
            colors.sort((a, b) => {
                const hsluvA = hsluv.hexToHsluv(a);
                const hsluvB = hsluv.hexToHsluv(b);
                return Math.round(0.06 * (hsluvA[0] - hsluvB[0])) || hsluvA[2] - hsluvB[2];
            });

            const slices = colors.map((color, i, arr) => ({
                fill: color,
                d: makeConicalCellSlice(+idx, grid, i, arr.length),
            }));

            out.push({ idx: +idx, slices });
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
