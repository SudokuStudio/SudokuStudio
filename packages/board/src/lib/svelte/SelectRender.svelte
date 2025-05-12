<script lang="ts">
    import { getBorderPath, idxMapToKeysArray } from '@sudoku-studio/board-utils/src';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { Geometry, Grid, IdxBitset } from '@sudoku-studio/schema';

    const {
        id,
        ref,
        grid,
        fill = '#08f',
        outlineOpacity = '#b2b2b2',
        innerOpacity = '#080808',
    }: {
        id: string;
        ref: StateRef<IdxBitset<Geometry.CELL>>;
        grid: Grid;
        fill?: string;
        outlineOpacity?: string;
        innerOpacity?: string;
    } = $props();

    const inset = 0.075;
    const bezierRounding = 0.125;

    const dMask = $derived(getBorderPath(idxMapToKeysArray($ref), grid, { inset, bezierRounding }) || undefined);
    const dFill = $derived(getBorderPath(idxMapToKeysArray($ref), grid) || undefined);
</script>

<mask id="select-{id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={grid.width} height={grid.height}>
    <rect x="0" y="0" width={grid.width} height={grid.height} fill={outlineOpacity} />
    <path d={dMask} fill={innerOpacity} stroke="none" />
</mask>
<path {id} d={dFill} {fill} stroke="none" mask="url(#select-{id}-mask)" />
