<script lang="ts">
    import { arrayObj2array, getBorderPath, idxMapToKeysArray, BOX_THICKNESS, BOX_THICKNESS_HALF } from "@sudoku-studio/board-utils";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;    // schema.BoxElement
    export let grid: { width: number, height: number };

    function each(regions: ArrayObj<IdxBitset<Geometry.CELL>>): string[] {
        return arrayObj2array(regions)
            .map((r) => getBorderPath(idxMapToKeysArray(r), grid, 0, false))
            .filter(v => v);
    }

</script>

<g {id}>
    {#each each($ref) as d}
        <path {d} fill="none" stroke="#000" stroke-width={BOX_THICKNESS } />
    {/each}
</g>
