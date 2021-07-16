<script lang="ts">
    import { derived } from "svelte/store";

    import { getEdges, bitsetToList, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };


    const fill = "#08f";
    const inset = 0.075;
    const innerRadius = 0.05;
    const outlineOpacity = '#b2b2b2';
    const innerOpacity = '#080808';
    const cursorSize = 0.2;

    const cursorRef = ref.ref('cursor');
    const dCursor = derived(cursorRef, cursorIdx => {
        if (null == cursorIdx) return '';
        const [ x, y ] = cellIdx2cellCoord(cursorIdx, grid);
        return `M${x},${y}L${x + cursorSize},${y}L${x},${y + cursorSize}Z`;
    });

    const selectRef = ref.ref('select');
    const dMask = derived(selectRef, select => getEdges(bitsetToList(select), grid, inset) || undefined);
    const dFill = derived(selectRef, select => getEdges(bitsetToList(select), grid, 0) || undefined);
</script>

<filter id="select-{id}-blur">
    <feGaussianBlur in="SourceGraphic" stdDeviation={innerRadius} />
    <feComponentTransfer>
        <feFuncR type="identity" />
        <feFuncG type="identity" />
        <feFuncB type="identity" />
        <feFuncA type="linear" slope="20" intercept="-9.5" />
    </feComponentTransfer>
</filter>
<mask id="select-{id}-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect x="0" y="0" width={grid.width} height={grid.height} fill={outlineOpacity} />
    <path d={$dMask} fill={innerOpacity} stroke="none" filter="url(#select-{id}-blur)" />
</mask>
<g {id}>
    <path d={$dCursor} {fill} stroke="none" />
    <path d={$dFill} {fill} stroke="none" mask="url(#select-{id}-mask)" />
</g>
