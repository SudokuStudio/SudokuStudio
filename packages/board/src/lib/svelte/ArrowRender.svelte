<script lang="ts">
    import { makePath, arrayObj2array } from '@sudoku-studio/board-utils/src';
    import type { Grid, schema } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.ArrowElement['value']>; grid: Grid } = $props();

    const bulbRadius = 0.375;
    const outlineWidth = 0.025;
    const strokeWidth = 0.025;

    const color = '#222';
</script>

<marker
    id="arrow-point-{id}"
    viewBox="0 0 1 1"
    refX="0.5"
    refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1"
    markerHeight="1"
    orient="auto"
>
    <path d="M 0.4,0.425 L 0.5,0.5 L 0.4,0.575" fill="none" stroke={color} stroke-width={strokeWidth} />
</marker>
<g {id}>
    {#each Object.entries($ref || {}) as [itemId, { bulb, body }] (itemId)}
        {@const dBulb = makePath(arrayObj2array(bulb || {}), grid)}
        {@const dBody = makePath(arrayObj2array(body || {}), grid, { shortenHead: bulbRadius, shortenTail: 0.2 })}
        <mask id="arrow-{id}-mask-{itemId}" maskUnits="userSpaceOnUse">
            <rect width={grid.width} height={grid.height} fill="#fff" />
            <path
                d={dBulb}
                fill="none"
                stroke="#000"
                stroke-width={2 * bulbRadius - outlineWidth}
                stroke-linejoin="round"
                stroke-linecap="round"
            />
        </mask>
        <path
            d={dBulb}
            fill="none"
            stroke={color}
            stroke-width={2 * bulbRadius + outlineWidth}
            mask="url(#arrow-{id}-mask-{itemId})"
            stroke-linejoin="round"
            stroke-linecap="round"
        />
        <path
            d={dBody}
            fill="none"
            stroke={color}
            stroke-width={strokeWidth}
            stroke-miterlimit="1.5"
            marker-end="url(#arrow-point-{id})"
        />
    {/each}
</g>
