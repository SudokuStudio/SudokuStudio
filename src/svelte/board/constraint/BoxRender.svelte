<script lang="ts">
    import { GRID_SCALE, BOX_THICKNESS, BOX_THICKNESS_HALF } from "../../../js/consts";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<pattern id="{id}-box" width={GRID_SCALE * $ref.width} height={GRID_SCALE * $ref.height} patternUnits="userSpaceOnUse">
    <rect width={GRID_SCALE * $ref.width} height={GRID_SCALE * $ref.height} stroke="#000" fill="none" stroke-width={BOX_THICKNESS} />
</pattern>
<rect {id}
    x={-BOX_THICKNESS_HALF}
    y={-BOX_THICKNESS_HALF}
    width={grid.width * GRID_SCALE + BOX_THICKNESS_HALF}
    height={grid.height * GRID_SCALE + BOX_THICKNESS_HALF}
    fill="url(#{id}-box)" stroke="none" />
