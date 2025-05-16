<script lang="ts">
    import { idxMapToKeysArray } from '@sudoku-studio/board-utils/src';
    import { cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';

    import type { Idx, Geometry, schema, Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const {
        id,
        ref,
        grid,
        color,
    }: { id: string; ref: StateRef<schema.RegionElement['value']>; grid: Grid; color: string } = $props();

    const margin = 0.025;
    const stroke = 2 * margin;
    const size = 1 - stroke;
</script>

<g {id}>
    {#each idxMapToKeysArray($ref) as cellIdx (cellIdx)}
        {@const [x, y] = cellIdx2cellCoord(cellIdx, grid)}
        <rect
            x={x + margin}
            y={y + margin}
            width={size}
            height={size}
            stroke={color}
            stroke-width={stroke}
            fill={color}
            fill-opacity="0.167"
        />
    {/each}
</g>
