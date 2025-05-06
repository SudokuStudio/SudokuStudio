<script lang="ts">
    import { derived } from 'svelte/store';

    import { cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { Geometry, Idx } from '@sudoku-studio/schema';

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number; height: number };

    const fill = '#08f';
    const cursorSize = 0.2;

    const dCursor = derived(ref, (cursorState) => {
        const { index, isShown } = cursorState as { index: Idx<Geometry.CELL>, isShown: boolean };

        if (!isShown) return '';
        const [x, y] = cellIdx2cellCoord(index, grid);
        return `M${x},${y}L${x + cursorSize},${y}L${x},${y + cursorSize}Z`;
    });
</script>

<path {id} d={$dCursor} {fill} stroke="none" />
