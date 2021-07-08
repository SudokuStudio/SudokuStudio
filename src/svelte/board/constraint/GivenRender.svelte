<script lang="ts">
    import { idx2xy } from "../../../js/board";
    import { GRID_SCALE } from "../../../js/consts";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<g {id}>
    {#each Object.entries($ref) as [ idx, num ] (idx)}
        <text x={idx2xy(+idx, grid).x + 0.5 * GRID_SCALE} y={idx2xy(+idx, grid).y + 0.5 * GRID_SCALE} text-anchor="middle" dominant-baseline="central" font-size={0.6 * GRID_SCALE}>{num}</text>
    {/each}
</g>
