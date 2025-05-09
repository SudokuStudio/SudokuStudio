<script lang="ts">
    import type { ArrayObj, Geometry, Grid, Idx, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { MakePathOptions } from '@sudoku-studio/board-utils/src';
    import { makePath, arrayObj2array } from '@sudoku-studio/board-utils/src';

    const {
        id,
        ref,
        grid,
        stroke = '#c7855c',
        strokeWidth = 0.125,
        pathOptions = { shortenHead: 0.2, shortenTail: 0.2, bezierRounding: 0.2, closeLoops: false },
    }: {
        id: string;
        ref: StateRef<schema.LineElement['value']>;
        grid: Grid;
        stroke?: string;
        strokeWidth?: number;
        pathOptions?: MakePathOptions;
    } = $props();

    type Item = { itemId: string; d: string };
    function each(items: schema.LineElement['value'] | null): Item[] {
        if (null == items) return [];
        const out: Item[] = [];
        for (const [itemId, idxArrObj] of Object.entries(items)) {
            const idxArr = arrayObj2array(idxArrObj);
            out.push({ itemId, d: makePath(idxArr, grid, pathOptions) });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref) as { itemId, d } (itemId)}
        <path
            {d}
            fill="none"
            stroke-linejoin="round"
            stroke-linecap="round"
            {stroke}
            stroke-width={strokeWidth}
            stroke-opacity="0.9"
        />
    {/each}
</g>
