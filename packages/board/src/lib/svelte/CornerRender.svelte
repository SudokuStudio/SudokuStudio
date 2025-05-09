<script lang="ts">
    import type { Grid, schema } from '@sudoku-studio/schema';
    import { idxMapToKeysArray, cellIdx2cellCoord, cornerMarkPos } from '@sudoku-studio/board-utils/src';
    import type { StateRef } from '@sudoku-studio/state-manager/src';

    const { id, ref, grid }: { id: string; ref: StateRef<schema.PencilMarksElement['value']>; grid: Grid } = $props();

    type Item = { idx: number; nums: { x: number; y: number; num: number }[] };
    function getMarks(cells: schema.PencilMarksElement['value']): Item[] {
        const out: Item[] = [];
        for (const [idx, numsBitset] of Object.entries(cells || {})) {
            const x = cellIdx2cellCoord(+idx, grid)[0] + 0.5;
            const y = cellIdx2cellCoord(+idx, grid)[1] + 0.5;
            const nums =
                typeof numsBitset !== 'object'
                    ? []
                    : idxMapToKeysArray(numsBitset).map((num, i, arr) => {
                          const [dx, dy] = cornerMarkPos(i, arr.length);
                          return { x: x + dx, y: y + dy, num };
                      });
            out.push({ idx: +idx, nums });
        }
        return out;
    }
</script>

<g {id} mask="url(#SUDOKU_MASK_GIVENS_FILLED)">
    {#each getMarks($ref || {}) as { idx, nums } (idx)}
        {#each nums as { x, y, num }}
            <text
                {x}
                {y}
                fill="#4e72b0"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="0.3"
                font-weight="600"
            >
                {num}
            </text>
        {/each}
    {/each}
</g>
