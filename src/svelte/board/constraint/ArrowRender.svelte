<script lang="ts">
    import { idx2xy } from "../../../js/boardUtils";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    // TODO: This should probably be a utility function.
    function makePath(idxArr: any): string {
        const points: string[] = [];

        let i = 0;
        let idx;
        while (null != (idx = idxArr[i])) {
            const { x, y } = idx2xy(idx, grid);
            points.push(`${x + 0.5},${y + 0.5}`);
            i++;
        }
        return `M ${points.join(' L ')}`;
    }
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
        <path d={makePath(idxArr)} fill="none" stroke="#ddd" stroke-width="0.2" marker-start="url(#thermo-bulb-{id})" stroke-linejoin="round" stroke-linecap="round" />
    {/each}
</g>
