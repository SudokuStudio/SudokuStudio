<script lang="ts">
    import { GRID_THICKNESS, GRID_THICKNESS_HALF } from '@sudoku-studio/board-utils/src';
    import type { Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref: _, grid }: { id: string; ref: StateRef<null>; grid: Grid } = $props();
</script>

<pattern id="grid-{id}" width="1" height="1" patternUnits="userSpaceOnUse">
    <rect width="1" height="1" stroke="#000" fill="none" stroke-width={GRID_THICKNESS} />
</pattern>
<rect
    {id}
    x={-GRID_THICKNESS_HALF}
    y={-GRID_THICKNESS_HALF}
    width={grid.width + GRID_THICKNESS_HALF}
    height={grid.height + GRID_THICKNESS_HALF}
    fill="url(#grid-{id})"
    stroke="none"
/>
