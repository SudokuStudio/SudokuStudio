<script lang="ts">
    import { arrayObj2array, cornerIdx2cornerCoord } from "@sudoku-studio/board-utils";
    import type { schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    export let id: string;
    export let ref: StateRef;
    export let grid: { width: number, height: number };

    const radius = 0.2125;
    const strokeWidth = 0.02;
    const fontSize = 0.20;

    const splitter = /.{1,2}/g;
    const splitterAtEdge = /./g;

    type Item = {
        idx: number, x: number, y: number,
        lines: { lx: number, ly: number, line: string, textAnchor: string, domBaseline: string }[]
    };
    function each(value: schema.QuadrupleElement['value']): Item[] {
        const out: Item[] = [];
        for (const [ cornerIdx, digits ] of Object.entries(value || {})) {
            const [ x, y ] = cornerIdx2cornerCoord(+cornerIdx, grid);
            const digitStr = arrayObj2array(digits as any).join('');

            const atSide = x <= 0 ? -1 : grid.width <= x ? +1 : 0;
            const atBotTop = y <= 0 ? -1 : grid.height <= y ? +1 : 0;

            const lines: Item['lines'] = (digitStr.match(atSide ? splitterAtEdge : splitter) || [])
                .map((line, i, lines) => {
                    return {
                        lx: x,
                        ly: y + 0.9 * fontSize * (i - 0.5 * (atBotTop + 1) * (lines.length - 1)),
                        line,
                        textAnchor: ['start', 'middle', 'end'][atSide + 1],
                        domBaseline: ['hanging', 'central', 'text-bottom'][atBotTop + 1],
                    }
                });
            out.push({
                idx: +cornerIdx,
                x, y, lines,
            });
        }
        return out;
    }
</script>

<mask id="quadruple-{id}-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <!-- Mask the board square. -->
    <rect x="0" y="0" width={grid.width} height={grid.height} fill="#fff" />
</mask>
<g {id}>
    {#each each($ref || {}) as { idx, x, y, lines } (idx)}
        <circle cx={x} cy={y} r={radius} fill="#fff" stroke="#000" stroke-width={strokeWidth} mask="url(#quadruple-{id}-mask)" />
        {#each lines as { lx, ly, line, textAnchor, domBaseline } }
            <text x={lx} y={ly} text-anchor={textAnchor} dominant-baseline={domBaseline} font-size={fontSize} font-weight="600">{line}</text>
        {/each}
    {/each}
</g>
