<script lang="ts">
    import { makePath, any } from "../js/utils";
    import type { StateRef } from "sudoku-studio-state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>


<marker id="arrow-head-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <path d="M 0.4,0.425 L 0.5,0.5 L 0.4,0.575" fill="none" stroke="#000" stroke-width="0.025" />
</marker>
<g {id}>
    {#each Object.entries($ref) as [ arrowId, headBody ] (arrowId)}
        <mask id="arrow-{id}-mask-{arrowId}" maskUnits="userSpaceOnUse">
            <rect width={grid.width} height={grid.height} fill="#fff" />
            <path d={makePath(any(headBody).head, grid)} fill="none" stroke="#000" stroke-width="0.75" stroke-linejoin="round" stroke-linecap="round" />
        </mask>
        <path d={makePath(any(headBody).head, grid)} fill="none" stroke="#000" stroke-width="0.8"   mask="url(#arrow-{id}-mask-{arrowId})" stroke-linejoin="round" stroke-linecap="round" />
        <path d={makePath(any(headBody).body, grid)} fill="none" stroke="#000" stroke-width="0.025" mask="url(#arrow-{id}-mask-{arrowId})" stroke-miterlimit="1.5" marker-end="url(#arrow-head-{id})" />
    {/each}
</g>
