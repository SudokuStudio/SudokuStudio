<script lang="ts">
    import type { ArrayObj, Geometry, Idx } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { MakePathOptions } from "@sudoku-studio/board-utils";
    import { makePath, arrayObj2array } from "@sudoku-studio/board-utils";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    export let stroke = '#c7855c';
    export let strokeWidth = 0.125;

    export let pathOptions: MakePathOptions = {
        shortenHead: 0.2,
        shortenTail: 0.2,
        bezierRounding: 0.2,
        closeLoops: false,
    };

    type Item = { itemId: string, d: string };
    function each(items: null | Record<string, ArrayObj<Idx<Geometry.CELL>>>): Item[] {
        if (null == items) return [];
        const out: Item[] = [];
        for (const [ itemId, idxArrObj ] of Object.entries(items)) {
            const idxArr = arrayObj2array(idxArrObj);
            out.push({
                itemId,
                d: makePath(idxArr, grid, pathOptions),
            });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref) as { itemId, d } (itemId)}
        <path {d} fill="none" stroke-linejoin="round" stroke-linecap="round"
            {stroke} stroke-width={strokeWidth} stroke-opacity="0.9" />
    {/each}
</g>
