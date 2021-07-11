<script lang="ts">
    import { cellIdx2cellCoord } from "../../../js/boardUtils";
    import type { StateRef } from "sudoku-studio-state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<!-- Path for ><. -->
<path id="min-{id}" d="M 0.08,0.38 L 0.12,0.50 L 0.08,0.62 M 0.38,0.08 L 0.50,0.12 L 0.62,0.08 M 0.92,0.62 L 0.88,0.50 L 0.92,0.38 M 0.62,0.92 L 0.50,0.88 L 0.38,0.92"
    fill="none" stroke="#000" stroke-width="0.025" stroke-miterlimit="1.5" />
<!-- Mask out four neighbors. -->
<path id="min-{id}-maskitem" d="M -0.5,0.5 L 0.5,-0.5 L 1.5,0.5 L 0.5,1.5 M 0,0 L 0,1 L 1,1 L 1,0" fill="#000" />
<!-- Mask. -->
<mask id="min-{id}-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <!-- Mask out board edges. -->
    <rect x="0.25" y="0.25" width={grid.width - 0.5} height={grid.height - 0.5} fill="#fff" />
    {#each Object.entries($ref) as [ idx, _true ] (idx)}
        <!-- Mask for each cell. -->
        <use href="#min-{id}-maskitem" transform="translate({cellIdx2cellCoord(+idx, grid)[0]},{cellIdx2cellCoord(+idx, grid)[1]})" fill="#000" />
    {/each}
</mask>
<rect width={grid.width} height={grid.height} fill="#fff" />
<g {id}>
    {#each Object.entries($ref) as [ idx, _true ] (idx)}
        <!-- Background color. -->
        <rect x={cellIdx2cellCoord(+idx, grid)[0]} y={cellIdx2cellCoord(+idx, grid)[1]} width="1" height="1" fill="#f0edf2" />
    {/each}
    <g mask="url(#min-{id}-mask)">
        {#each Object.entries($ref) as [ idx, _true ] (idx)}
            <!-- Each >< cell. -->
            <use href="#min-{id}" transform="translate({cellIdx2cellCoord(+idx, grid)[0]},{cellIdx2cellCoord(+idx, grid)[1]})" />
        {/each}
    </g>
</g>
