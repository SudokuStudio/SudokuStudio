<script lang="ts">
    import { BOX_THICKNESS, BOX_THICKNESS_HALF } from "../../../js/consts";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<pattern id="{id}-box" width={$ref.width} height={$ref.height} patternUnits="userSpaceOnUse">
    <rect width={$ref.width} height={$ref.height} stroke="#000" fill="none" stroke-width={BOX_THICKNESS} />
</pattern>
<rect {id}
    x={-BOX_THICKNESS_HALF}
    y={-BOX_THICKNESS_HALF}
    width={grid.width + BOX_THICKNESS_HALF}
    height={grid.height + BOX_THICKNESS_HALF}
    fill="url(#{id}-box)" stroke="none" />
