<script lang="ts">
    import { bitsetToList, getEdges, getFirstFromBitset, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
    import type { Geometry, schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const inset = 0.075;
    const fontSize = 0.2;
    const stroke = 0.015;

    function each(value: schema.KillerElement['value']): { cageId: string, sum: number, labelPos: { x: number, y: number }, d: string }[] {
        const out: { cageId: string, sum: number, labelPos: { x: number, y: number }, d: string }[] = [];
        for (const [ cageId, { sum, cells } ] of Object.entries(value)) {
            const firstIdx = getFirstFromBitset<Geometry.CELL>(cells, grid);
            const d = getEdges(bitsetToList(cells), grid, inset);
            if (null != d && null != firstIdx) {
                const firstCoord = cellIdx2cellCoord(firstIdx, grid);
                const labelPos = {
                    x: firstCoord[0] + inset - stroke,
                    y: firstCoord[1] + inset - stroke,
                };
                out.push({ cageId, sum, labelPos, d });
            }
        }
        return out;
    }
</script>


<mask id="killer-{id}-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect x="0" y="0" width={grid.width} height={grid.height} fill="#fff" />
    {#each each($ref) as { cageId, sum, labelPos } (cageId)}
        <!-- Mask-out each sum label. -->
        <rect x={labelPos.x} y={labelPos.y} width={0.7 * `${sum}`.length * fontSize} height={1.1 * fontSize} fill="#000" />
    {/each}
</mask>
<g {id}>
    {#each each($ref) as { cageId, sum, labelPos, d } (cageId)}
        <text x={labelPos.x} y={labelPos.y} text-anchor="start" dominant-baseline="hanging" font-size={fontSize} font-weight="700">{sum}</text>
        <path {d} fill="none" stroke="#000" stroke-width={stroke} stroke-dasharray="0.075 0.04" mask="url(#killer-{id}-mask)" />
    {/each}
</g>
