<script lang="ts">
    import { cellIdx2cellCoord, idxMapToKeysArray } from '@sudoku-studio/board-utils/src';
    import type { schema, Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.RegionElement['value']>; grid: Grid } = $props();
    const r = 0.425;
</script>

<g {id}>
    {#each idxMapToKeysArray($ref) as cellIdx (cellIdx)}
        {@const [x, y] = cellIdx2cellCoord(+cellIdx, grid)}
        <circle cx={x + 0.5} cy={y + 0.5} {r} fill="#666" fill-opacity="0.267" />
    {/each}
</g>
