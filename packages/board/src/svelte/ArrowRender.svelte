<script lang="ts">
    import { makePath, arrayObj2array } from "@sudoku-studio/board-utils";
    import type { schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const bulbRadius = 0.375;
    const outlineWidth = 0.025;
    const strokeWidth = 0.025;


    type Item = { arrowId: string, dBulb: string, dBody: string };
    function each(value: schema.ArrowElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ arrowId, { bulb, body } ] of Object.entries(value)) {
            const dBulb = makePath(arrayObj2array(bulb || {}), grid);
            const dBody = makePath(arrayObj2array(body || {}), grid, { shortenHead: bulbRadius, shortenTail: 0.2 });
            out.push({ arrowId, dBulb, dBody });
        }
        return out;
    }
</script>


<marker id="arrow-bulb-{id}"
    viewBox="0 0 1 1" refX="0.5" refY="0.5"
    markerUnits="userSpaceOnUse"
    markerWidth="1" markerHeight="1"
    orient="auto"
>
    <path d="M 0.4,0.425 L 0.5,0.5 L 0.4,0.575" fill="none" stroke="#000" stroke-width={strokeWidth} />
</marker>
<g {id}>
    {#each each($ref || {}) as { arrowId, dBulb, dBody } (arrowId)}
        <mask id="arrow-{id}-mask-{arrowId}" maskUnits="userSpaceOnUse">
            <rect width={grid.width} height={grid.height} fill="#fff" />
            <path d={dBulb} fill="none" stroke="#000" stroke-width={2 * bulbRadius - outlineWidth} stroke-linejoin="round" stroke-linecap="round" />
        </mask>
        <path d={dBulb} fill="none" stroke="#000" stroke-width={2 * bulbRadius + outlineWidth}
            mask="url(#arrow-{id}-mask-{arrowId})" stroke-linejoin="round" stroke-linecap="round" />
        <path d={dBody} fill="none" stroke="#000" stroke-width={strokeWidth}
            stroke-miterlimit="1.5" marker-end="url(#arrow-bulb-{id})" />
    {/each}
</g>
