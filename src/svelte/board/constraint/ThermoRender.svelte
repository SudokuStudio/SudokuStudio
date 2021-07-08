<script lang="ts">
    import { makePath, any } from "../../../js/boardUtils";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>


<marker id="thermo-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <circle cx="0.5" cy="0.5" r="0.4" fill="#ddd" />
</marker>
<g {id}>
    {#each Object.entries($ref) as [ thermoId, idxArr ] (thermoId)}
        <path d={makePath(any(idxArr), grid)} fill="none" stroke="#ddd" stroke-width="0.2" marker-start="url(#thermo-bulb-{id})" stroke-linejoin="round" stroke-linecap="round" />
    {/each}
</g>
