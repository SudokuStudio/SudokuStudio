<script lang="ts">
    import { derived } from "svelte/store";

    import { getEdges, bitsetToList } from "../js/utils";
    import type { StateRef } from "sudoku-studio-state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const inset = 0.075;
    const innerRadius = 0.05;
    const transparency = '#080808';
    let dMask = derived(ref, $ref => getEdges(bitsetToList($ref), grid, inset)!);
    let dFill = derived(ref, $ref => getEdges(bitsetToList($ref), grid, 0)!);
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
    <rect x="0" y="0" width={grid.width} height={grid.height} fill="#fff" />
    <path d={$dMask} fill={transparency} stroke="none" filter="url(#select-{id}-blur)" />
</mask>
<path {id} d={$dFill} fill="#08f" fill-opacity="0.7" stroke="none" mask="url(#select-{id}-mask)" />
