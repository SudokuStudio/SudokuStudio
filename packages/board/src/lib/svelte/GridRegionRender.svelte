<script lang="ts">
    import {
        arrayObj2array,
        getBorderPath,
        idxMapToKeysArray,
        GRID_REGION_THICKNESS,
    } from '@sudoku-studio/board-utils/src';
    import type { ArrayObj, Geometry, IdxBitset } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    export let id: string;
    export let ref: StateRef; // schema.GridRegionElement
    export let grid: { width: number; height: number };

    function each(regions: ArrayObj<IdxBitset<Geometry.CELL>>): string[] {
        function isNonEmptyString(s: string | null): s is string {
            return s != null && s.length > 0;
        }
        return arrayObj2array(regions)
            .map((r) => getBorderPath(idxMapToKeysArray(r), grid, 0, false))
            .filter(isNonEmptyString);
    }
</script>

<g {id}>
    {#each each($ref) as d}
        <path {d} fill="none" stroke="#000" stroke-width={GRID_REGION_THICKNESS} />
    {/each}
</g>
