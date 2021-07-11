<script lang="ts">
    import { BOX_THICKNESS, BOX_THICKNESS_HALF } from "../../../js/boardUtils";
    import type { StateRef } from "sudoku-studio-state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<pattern id="box-{id}" width={$ref.width} height={$ref.height} patternUnits="userSpaceOnUse">
    <rect width={$ref.width} height={$ref.height} stroke="#000" fill="none" stroke-width={BOX_THICKNESS} />
</pattern>
<rect {id}
    x={-BOX_THICKNESS_HALF}
    y={-BOX_THICKNESS_HALF}
    width={grid.width + BOX_THICKNESS_HALF}
    height={grid.height + BOX_THICKNESS_HALF}
    fill="url(#box-{id})" stroke="none" />
