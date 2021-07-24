<script lang="ts">
    import type { ArrayObj, Geometry, Idx } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";
    import { makePath, arrayObj2array } from "@sudoku-studio/board-utils";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };
    export let isSlow: boolean = true;

    const bulbRadius = 0.375;

    export function getThermos(thermos: Record<string, ArrayObj<Idx<Geometry.CELL>>>): { thermoId: string, d: string, invalid: boolean }[] {
        const out: { thermoId: string, d: string, invalid: boolean }[] = [];
        for (const [ thermoId, idxArrObj ] of Object.entries(thermos)) {
            const idxArr = arrayObj2array(idxArrObj);
            out.push({
                thermoId,
                d: makePath(idxArr, grid, { shortenTail: 0.25, bezierRounding: 0.2 }),
                invalid: idxArr.length > grid.width,
            });
        }
        return out;
    }
</script>


<marker id="thermo-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <circle cx="0.5" cy="0.5" r={bulbRadius} fill="#444" />
</marker>

<marker id="slow-thermo-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <path
        d="M0.35, 0.13 L0.65, 0.13 L0.86, 0.34 L0.86, 0.64 L0.64, 0.86 L0.35, 0.86 L0.13, 0.65 L0.13, 0.35 Z"
        stroke="#444"
        fill="aaa"
    />
</marker>

<mask id="thermo-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    {#each getThermos($ref || {}) as { thermoId, d, invalid } (thermoId)}
        {#if isSlow}
            <path {d} fill="none" stroke= "#444" stroke-width="0.2"
            marker-start="url(#slow-thermo-bulb-{id})"
            stroke-linejoin="round"
            stroke-dasharray="0.4 0.1"  />
        {:else}
            <path {d} fill="none" stroke={invalid && ! isSlow ? "#fff" : "#444"} stroke-width="0.2"
            marker-start="url(#thermo-bulb-{id})" stroke-linejoin="round" stroke-linecap="round" />
        {/if}
    {/each}
</mask>
<g {id}>
    <rect x="0" y="0" width={grid.width} height={grid.height} fill="#888" stroke="none" mask="url(#thermo-{id}-mask)" />
</g>
