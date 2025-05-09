<script lang="ts" module>
    import type { Idx, Geometry, Grid, Coord, IdxMap } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    export type Props = {
        id: string;
        ref: StateRef<IdxMap<Geometry, true | number> | null>;
        grid: Grid;
        idx2coord: (idx: Idx<Geometry>, grid: Grid) => Coord<any>;
        stroke?: string;
        fill?: string;
        textColor?: string;
        radius?: number;
        strokeWidth?: number;
        fontSize?: number;
        fontWeight?: number;
        mapDigits?: (num: true | number) => string;
    };
</script>

<script lang="ts">
    const {
        id,
        ref,
        grid,
        idx2coord,
        stroke = '#242424',
        fill = '#fff',
        textColor = '#000',
        radius = 0.15,
        strokeWidth = 0.02,
        fontSize = 0.25,
        fontWeight = 600,
        mapDigits = (num: true | number): string => (true !== num ? `${num}` : ''),
    }: Props = $props();
</script>

<g {id}>
    {#each Object.entries($ref || {}) as [idx, digitOrTrue] (idx)}
        {@const text = mapDigits(digitOrTrue!)}
        {@const [x, y] = idx2coord(+idx, grid)}
        {#if 0 < radius}
            <circle cx={x} cy={y} r={radius} {fill} {stroke} stroke-width={strokeWidth} />
        {/if}
        <text
            {x}
            {y}
            text-anchor="middle"
            dominant-baseline="central"
            fill={textColor}
            font-size={fontSize}
            font-weight={fontWeight}>{text}</text
        >
    {/each}
</g>
