<script lang="ts">
    import { cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';
    import type { Grid, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const {
        id,
        ref,
        grid,
        color = '#000',
        mask = undefined,
    }: {
        id: string;
        ref: StateRef<schema.DigitElement['value']>;
        grid: Grid;
        color?: string;
        mask?: string;
    } = $props();
</script>

<g {id} {mask}>
    {#each Object.entries($ref || {}) as [cellIdx, num] (cellIdx)}
        <text
            x={cellIdx2cellCoord(+cellIdx, grid)[0] + 0.5}
            y={cellIdx2cellCoord(+cellIdx, grid)[1] + 0.5}
            fill={color}
            text-anchor="middle"
            dominant-baseline="central"
            font-size="0.775"
            font-weight="600">{num}</text
        >
    {/each}
</g>
