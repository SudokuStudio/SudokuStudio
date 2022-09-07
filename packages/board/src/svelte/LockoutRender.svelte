<script lang="ts">
    import type { ArrayObj, Coord, Geometry, Idx } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";
    import { makePath, arrayObj2array, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import { derived } from "svelte/store";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const diamondSize = 0.65;
    const diamondOffset = (1 - diamondSize) / 2;
    const outlineWidth = 0.025;
    const strokeWidth = 0.15;

    const diamondOutline = '#0000ff';
    const diamondFill = '#e7e6ff';
    const lineColor = '#aabeef';

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
                d: makePath(idxArr, grid, { shortenHead: diamondSize / 2, shortenTail: diamondSize / 2, bezierRounding: 0.2 }),
            });
        }
        return out;
    }
    const items = derived(ref, getItems);
</script>

<style>
    .lockout-diamond {
        transform-origin: center;
        transform-box: fill-box;
    }
</style>
<mask id="lockout-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect width={grid.width} height={grid.height} fill="#fff" />
</mask>
<g {id}>
    {#each $items as { itemId, d, head, tail } (itemId)}
        <path {d} fill="none" stroke={lineColor} stroke-opacity="0.95" stroke-linejoin="round" stroke-linecap="butt"
            stroke-width={strokeWidth} mask="url(#lockout-{id}-mask)" />
        <rect x={head[0] + diamondOffset} y={head[1] + diamondOffset} width={diamondSize} height={diamondSize} transform="rotate(45)" fill={diamondFill} stroke={diamondOutline} stroke-width={outlineWidth} class="lockout-diamond" />
        <rect x={tail[0] + diamondOffset} y={tail[1] + diamondOffset} width={diamondSize} height={diamondSize} transform="rotate(45)" fill={diamondFill} stroke={diamondOutline} stroke-width={outlineWidth} class="lockout-diamond" />
    {/each}
</g>
