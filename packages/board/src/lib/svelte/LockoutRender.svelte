<script lang="ts">
    import type { Grid, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import { makePath, arrayObj2array, cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.LineElement['value']>; grid: Grid } = $props();

    const diamondSize = 0.65;
    const diamondOffset = (1 - diamondSize) / 2;
    const outlineWidth = 0.025;
    const strokeWidth = 0.15;

    const diamondOutline = '#0000ff';
    const diamondFill = '#e7e6ff';
    const lineColor = '#aabeef';
</script>

<mask id="lockout-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect width={grid.width} height={grid.height} fill="#fff" />
</mask>
<g {id}>
    {#each Object.entries($ref || {}) as [itemId, idxArrayObj] (itemId)}
        {@const idxArr = arrayObj2array(idxArrayObj)}
        {@const head = cellIdx2cellCoord(idxArr[0], grid)}
        {@const tail = cellIdx2cellCoord(idxArr[idxArr.length - 1], grid)}
        {@const d = makePath(idxArr, grid, {
            shortenHead: diamondSize / 2,
            shortenTail: diamondSize / 2,
            bezierRounding: 0.3,
        })}
        <path
            {d}
            fill="none"
            stroke={lineColor}
            stroke-opacity="0.95"
            stroke-linejoin="round"
            stroke-linecap="butt"
            stroke-width={strokeWidth}
            mask="url(#lockout-{id}-mask)"
        />
        <rect
            x={head[0] + diamondOffset}
            y={head[1] + diamondOffset}
            width={diamondSize}
            height={diamondSize}
            transform="rotate(45)"
            fill={diamondFill}
            stroke={diamondOutline}
            stroke-width={outlineWidth}
            class="lockout-diamond"
        />
        <rect
            x={tail[0] + diamondOffset}
            y={tail[1] + diamondOffset}
            width={diamondSize}
            height={diamondSize}
            transform="rotate(45)"
            fill={diamondFill}
            stroke={diamondOutline}
            stroke-width={outlineWidth}
            class="lockout-diamond"
        />
    {/each}
</g>

<style>
    .lockout-diamond {
        transform-origin: center;
        transform-box: fill-box;
    }
</style>
