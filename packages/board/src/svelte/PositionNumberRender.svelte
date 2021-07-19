<script lang="ts">
    import type { Idx, Geometry, schema, Grid, Coord } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    export let idx2coord: (idx: Idx<Geometry>, grid: Grid) => Coord<any>;

    export let stroke: string = "#242424";
    export let fill: string = "#fff";
    export let textColor: string = "#000";

    export let radius = 0.15;
    export let strokeWidth = 0.02;
    export let fontSize = 0.25;
    export let fontWeight = 600;

    export let mapDigits = (num: true | number): string => true !== num ? `${num}` : '';


    type Item = { idx: Idx<Geometry>, x: number, y: number, text: string };
    function each(value: schema.SeriesNumberElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ idx, digitOrTrue ] of Object.entries(value)) {
            const text = mapDigits(digitOrTrue!);
            const [ x, y ] = idx2coord(+idx, grid);
            out.push({
                idx: +idx,
                x, y, text,
            });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref || {}) as { idx, x, y, text } (idx)}
        {#if 0 < radius}
            <circle cx={x} cy={y} r={radius} {fill} {stroke} stroke-width={strokeWidth} />
        {/if}
        <text {x} {y} text-anchor="middle" dominant-baseline="central" fill={textColor} font-size={fontSize} font-weight={fontWeight}>{text}</text>
    {/each}
</g>
