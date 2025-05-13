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
        {@const [x, y] = cellIdx2cellCoord(+cellIdx, grid).map((z) => z + 0.5)}
        <text {x} {y} fill={color} text-anchor="middle" dominant-baseline="central" font-size="0.775" font-weight="600"
            >{num}</text
        >
    {/each}
</g>
