<script lang="ts">
    import type { ArrayObj, Geometry, Idx } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";
    import { makePath, arrayObj2array } from "@sudoku-studio/board-utils";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    type Item = { itemId: string, d: string };
    export function getItems(thermos: Record<string, ArrayObj<Idx<Geometry.CELL>>>): Item[] {
        const out: Item[] = [];
        for (const [ itemId, idxArrObj ] of Object.entries(thermos)) {
            const idxArr = arrayObj2array(idxArrObj);
            out.push({
                itemId,
                d: makePath(idxArr, grid),
            });
        }
        return out;
    }
</script>


<marker id="between-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <circle cx="0.5" cy="0.5" r="0.4" fill="none" stroke="#000" stroke-width="0.025" />
</marker>
<g {id}>
    {#each getItems($ref || {}) as { itemId, d } (itemId)}
        <path {d} fill="none" stroke="#c18bb7" stroke-width="0.1"
            marker-start="url(#between-bulb-{id})" marker-end="url(#between-bulb-{id})" stroke-linejoin="round" stroke-linecap="round" />
    {/each}
</g>
