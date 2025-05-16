<script lang="ts">
    import type { Grid, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import { makePath, arrayObj2array, cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.LineElement['value']>; grid: Grid } = $props();

    const bulbRadius = 0.375;
    const outlineWidth = 0.025;
    const strokeWidth = 0.15;
</script>

<mask id="between-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect width={grid.width} height={grid.height} fill="#fff" />
</mask>
<g {id}>
    {#each Object.entries($ref || {}) as [itemId, idxArrObj] (itemId)}
        {@const idxArr = arrayObj2array(idxArrObj)}
        {@const head = cellIdx2cellCoord(idxArr[0], grid)}
        {@const tail = cellIdx2cellCoord(idxArr[idxArr.length - 1], grid)}
        {@const d = makePath(idxArr, grid, { shortenHead: bulbRadius, shortenTail: bulbRadius, bezierRounding: 0.2 })}
        <path
            {d}
            fill="none"
            stroke="#c18bb7"
            stroke-opacity="0.95"
            stroke-linejoin="round"
            stroke-linecap="butt"
            stroke-width={strokeWidth}
            mask="url(#between-{id}-mask)"
        />
        <circle
            cx={head[0] + 0.5}
            cy={head[1] + 0.5}
            r={bulbRadius}
            fill="none"
            stroke="#000"
            stroke-width={outlineWidth}
        />
        <circle
            cx={tail[0] + 0.5}
            cy={tail[1] + 0.5}
            r={bulbRadius}
            fill="none"
            stroke="#000"
            stroke-width={outlineWidth}
        />
    {/each}
</g>
