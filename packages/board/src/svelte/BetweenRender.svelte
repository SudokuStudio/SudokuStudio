<script lang="ts">
    import type { ArrayObj, Coord, Geometry, Idx } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";
    import { makePath, arrayObj2array, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import { derived } from "svelte/store";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const bulbRadius = 0.375;
    const outlineWidth = 0.025;
    const strokeWidth = 0.15;

    type Item = { itemId: string, d: string, head: Coord<Geometry.CELL>, tail: Coord<Geometry.CELL> };
    function getItems(items: null | Record<string, ArrayObj<Idx<Geometry.CELL>>>): Item[] {
        if (null == items) return [];
        const out: Item[] = [];
        for (const [ itemId, idxArrObj ] of Object.entries(items)) {
            const idxArr = arrayObj2array(idxArrObj);
            out.push({
                head: cellIdx2cellCoord(idxArr[0], grid),
                tail: cellIdx2cellCoord(idxArr[idxArr.length - 1], grid),
                itemId,
                d: makePath(idxArr, grid),
            });
        }
        return out;
    }
    const items = derived(ref, getItems);
</script>


<marker id="between-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <circle cx="0.5" cy="0.5" r={bulbRadius + 0.5 * outlineWidth} fill="#000" />
</marker>
<mask id="between-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect width={grid.width} height={grid.height} fill="#fff" />
    {#each $items as { itemId, head, tail } (itemId)}
        <circle cx={head[0] + 0.5} cy={head[1] + 0.5} r={bulbRadius - 0.5 * outlineWidth} fill="#000" stroke="none" />
        <circle cx={tail[0] + 0.5} cy={tail[1] + 0.5} r={bulbRadius - 0.5 * outlineWidth} fill="#000" stroke="none" />
    {/each}
</mask>
<g {id}>
    {#each $items as { itemId, d } (itemId)}
        <path {d} fill="none" stroke="#c18bb7" stroke-opacity="0.95" stroke-linejoin="round" stroke-linecap="round"
            stroke-width={strokeWidth} mask="url(#between-{id}-mask)"
            marker-start="url(#between-bulb-{id})" marker-end="url(#between-bulb-{id})" />
    {/each}
</g>
