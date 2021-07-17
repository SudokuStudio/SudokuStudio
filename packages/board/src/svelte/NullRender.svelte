<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    // @ts-ignore
    const _ = [ id, ref, grid ]; // Unused.
</script>
