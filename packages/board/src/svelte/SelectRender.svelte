<script lang="ts">
    import { derived } from "svelte/store";

    import { getEdges, idxMapToKeysArray } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const inset = 0.075;
    const innerRadius = 0.05;

    export let fill = "#08f";
    export let outlineOpacity = '#b2b2b2';
    export let innerOpacity = '#080808';

    const dMask = derived(ref, select => getEdges(idxMapToKeysArray(select), grid, inset) || undefined);
    const dFill = derived(ref, select => getEdges(idxMapToKeysArray(select), grid, 0) || undefined);
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
<mask id="select-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect x="0" y="0" width={grid.width} height={grid.height} fill={outlineOpacity} />
    <path d={$dMask} fill={innerOpacity} stroke="none" filter="url(#select-{id}-blur)" />
</mask>
<path {id} d={$dFill} {fill} stroke="none" mask="url(#select-{id}-mask)" />
