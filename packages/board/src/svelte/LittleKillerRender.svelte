<script lang="ts">
import { diagonalIdx2dirVec, diagonalIdx2svgCoord } from "@sudoku-studio/board-utils";

    import type { Idx, Geometry, schema, IdxMap } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const color: string = "#000";
    const fontSize = 0.4;
    const fontWeight = 800;
    const strokeWidth = 0.025;

    const arrowStart = 0.4 * fontSize;
    const arrowEnd = arrowStart + 0.2;

    type Item = { idx: Idx<Geometry.EDGE>, x: number, y: number, text: string, d: string };
    function each(value: schema.SeriesNumberElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ diagIdx, digitOrTrue ] of Object.entries(value || {})) {
            const text = true !== digitOrTrue ? `${digitOrTrue}` : '_';
            const [ x, y ] = diagonalIdx2svgCoord(+diagIdx, grid, -0.9);
            const vec = diagonalIdx2dirVec(+diagIdx);
            out.push({
                idx: +diagIdx,
                x, y, text,
                d: `M${x + arrowStart * vec[0]},${y + arrowStart * vec[1]}L${x + arrowEnd * vec[0]},${y + arrowEnd * vec[1]}`,
            });
        }
        return out;
    }
</script>

<marker id="lk-arrow-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <path d="M 0.4,0.425 L 0.5,0.5 L 0.4,0.575" fill="none" stroke={color} stroke-width={strokeWidth} />
</marker>
<g {id}>
    {#each each($ref || {}) as { idx, x, y, text, d } (idx)}
        <path {d} stroke={color} stroke-width={strokeWidth} marker-end="url(#lk-arrow-{id})" />
        <text {x} {y} text-anchor="middle" dominant-baseline="central"
            fill={color} font-size={fontSize} font-weight={fontWeight}
            textLength={text.length > 2 ? 1.2 * fontSize : undefined} lengthAdjust="spacingAndGlyphs">{text}</text>
    {/each}
</g>
