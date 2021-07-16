<script lang="ts">
    import { cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    export let color: string = '#000';
    export let mask: string | undefined = undefined;
</script>

<g {id} {mask}>
    {#each Object.entries($ref || {}) as [ idx, num ] (idx)}
        <text x={cellIdx2cellCoord(+idx, grid)[0] + 0.5} y={cellIdx2cellCoord(+idx, grid)[1] + 0.5}
            fill={color} text-anchor="middle" dominant-baseline="central" font-size="0.8" font-weight="600">{num}</text>
    {/each}
</g>
