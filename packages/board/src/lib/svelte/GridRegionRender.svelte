<script lang="ts">
    import {
        arrayObj2array,
        getBorderPath,
        idxMapToKeysArray,
        GRID_REGION_THICKNESS,
    } from '@sudoku-studio/board-utils/src';
    import type { Grid, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.GridRegionElement['value']>; grid: Grid } = $props();
</script>

<g {id}>
    {#each arrayObj2array($ref || {}) as region, i (i)}
        {@const d = getBorderPath(idxMapToKeysArray(region), grid)}
        {#if d != null && 0 < d.length}
            <path {d} fill="none" stroke="#000" stroke-width={GRID_REGION_THICKNESS} />
        {/if}
    {/each}
</g>
