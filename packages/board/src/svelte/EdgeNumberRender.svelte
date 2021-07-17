<script lang="ts">
    import { edgeIdx2svgCoord } from "@sudoku-studio/board-utils";
    import type { Idx, Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    export let stroke: string = "#242424";
    export let fill: string = "#fff";
    export let textColor: string = "#000";

    export let radius = 0.15;
    export let strokeWidth = 0.02;
    export let fontSize = 0.25;
    export let fontWeight = 600;

    export let mapDigits = (num: true | number): string => true !== num ? `${num}` : '';


    type Item = { idx: Idx<Geometry.EDGE>, x: number, y: number, text: string };
    function each(value: schema.EdgeNumberElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ edgeIdx, digitOrTrue ] of Object.entries(value)) {
            const text = mapDigits(digitOrTrue!);
            const [ x, y ] = edgeIdx2svgCoord(+edgeIdx, grid);
            out.push({
                idx: +edgeIdx,
                x, y, text,
            });
        }
        return out;
    }
</script>

<g {id}>
    {#each each($ref || {}) as { idx, x, y, text } (idx)}
        <circle cx={x} cy={y} r={radius} {fill} {stroke} stroke-width={strokeWidth} />
        <text {x} {y} text-anchor="middle" dominant-baseline="central" fill={textColor} font-size={fontSize} font-weight={fontWeight}>{text}</text>
    {/each}
</g>
