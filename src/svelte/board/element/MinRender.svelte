<script lang="ts">
    import { idx2xy } from "../../../js/boardUtils";
    import type { StateRef } from "../../../js/state_manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
</script>

<path id="min-{id}" d="M 0.08,0.38 L 0.12,0.50 L 0.08,0.62 M 0.38,0.08 L 0.50,0.12 L 0.62,0.08 M 0.92,0.62 L 0.88,0.50 L 0.92,0.38 M 0.62,0.92 L 0.50,0.88 L 0.38,0.92"
    fill="none" stroke="#000" stroke-width="0.025" stroke-miterlimit="1.5" />
<path id="min-{id}-maskitem" d="M -0.5,0.5 L 0.5,-0.5 L 1.5,0.5 L 0.5,1.5 M 0,0 L 0,1 L 1,1 L 1,0" fill="#000" />
<mask id="min-{id}-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect x="0.25" y="0.25" width={grid.width - 0.5} height={grid.height - 0.5} fill="#fff" />
    {#each Object.entries($ref) as [ idx, _true ] (idx)}
        <use href="#min-{id}-maskitem" transform="translate({idx2xy(+idx, grid).x},{idx2xy(+idx, grid).y})" fill="#000" />
    {/each}
</mask>
<rect width={grid.width} height={grid.height} fill="#fff" />
<g {id}>
    {#each Object.entries($ref) as [ idx, _true ] (idx)}
        <rect x={idx2xy(+idx, grid).x} y={idx2xy(+idx, grid).y} width="1" height="1" fill="#f0edf2" />
    {/each}
    <g mask="url(#min-{id}-mask)">
        {#each Object.entries($ref) as [ idx, _true ] (idx)}
            <use href="#min-{id}" transform="translate({idx2xy(+idx, grid).x},{idx2xy(+idx, grid).y})" />
        {/each}
    </g>
</g>
