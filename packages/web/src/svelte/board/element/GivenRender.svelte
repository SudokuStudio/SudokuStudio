<script lang="ts">
    import { cellIdx2cellCoord } from "../../../js/boardUtils";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<g {id}>
    {#each Object.entries($ref) as [ idx, num ] (idx)}
        <text x={cellIdx2cellCoord(+idx, grid)[0] + 0.5} y={cellIdx2cellCoord(+idx, grid)[1] + 0.5} text-anchor="middle" dominant-baseline="central" font-size="0.6" font-weight="700">{num}</text>
    {/each}
</g>
