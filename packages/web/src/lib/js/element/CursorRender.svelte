<script lang="ts">
    import { derived } from 'svelte/store';
    import { cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { Grid, user } from '@sudoku-studio/schema';

    const { id, ref, grid }: { id: string; ref: StateRef<user.UserState['cursor']>; grid: Grid } = $props();

    const fill = '#08f';
    const cursorSize = 0.2;

    const dCursor = derived(ref, (cursorState) => {
        if (null == cursorState) return '';
        const { index, isShown } = cursorState;

        if (!isShown || null == index) return '';
        const [x, y] = cellIdx2cellCoord(index, grid);
        return `M${x},${y}L${x + cursorSize},${y}L${x},${y + cursorSize}Z`;
    });
</script>

<path {id} d={$dCursor} {fill} stroke="none" />
