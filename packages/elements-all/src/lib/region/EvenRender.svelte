<script lang="ts">
    import { cellIdx2cellCoord, idxMapToKeysArray } from '@sudoku-studio/board-utils/src';
    import type { schema, Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.RegionElement['value']>; grid: Grid } = $props();

    const margin = 0.125;
    const size = 1 - 2 * margin;
</script>

<g {id}>
    {#each idxMapToKeysArray($ref) as cellIdx (cellIdx)}
        {@const [x, y] = cellIdx2cellCoord(+cellIdx, grid)}
        <rect x={x + margin} y={y + margin} width={size} height={size} fill="#666" fill-opacity="0.267" />
    {/each}
</g>
