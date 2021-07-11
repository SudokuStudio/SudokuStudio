<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const positive = ref.ref('positive');
    const negative = ref.ref('negative');
</script>

<g {id}>
    <line class:hide={!$positive} x1="0" y1={grid.height} x2={grid.width} y2="0" />
    <line class:hide={!$negative} x1="0" y1="0" x2={grid.width} y2={grid.height} />
</g>

<style lang="scss">
    line {
        stroke: rgba(0, 0, 0, 0.2);
        stroke-width: 0.02;
    }
</style>
