<script lang="ts">
    import { getEdges } from "../../../js/boardUtils";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    function each(value: schema.KillerElement['value']): { cageId: string, sum: number, d: string }[] {
        const out: { cageId: string, sum: number, d: string }[] = [];
        for (const [ cageId, { sum, cells } ] of Object.entries(value)) {
            const d = getEdges(cells, grid, 0.1);
            if (null != d)
                out.push({ cageId, sum, d });
        }
        return out;
    }
</script>


<g {id}>
    {#each each($ref) as { cageId, sum: _, d } (cageId)}
        <path {d} fill="rgba(255,0,255,0.1)" stroke="#f0f" stroke-width="0.05" />
    {/each}
</g>
