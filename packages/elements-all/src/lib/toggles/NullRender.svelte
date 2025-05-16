<script lang="ts">
    import type { Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<any>; grid: Grid } = $props();
    const _ = [id, ref, grid];
</script>
