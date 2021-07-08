<script lang="ts" context="module">
    const GRID_SCALE = 100;
    const GRID_THICKNESS = 0.01 * GRID_SCALE;
    const GRID_THICKNESS_HALF = 0.5 * GRID_THICKNESS;
</script>
<script lang="ts">
    import { boardState } from "../../js/board";

    const grid = boardState.ref('grid');

    const GRID_WIDTH:  number = GRID_SCALE * $grid.width;
    const GRID_HEIGHT: number = GRID_SCALE * $grid.height;
</script>

<svg id="sudoku" viewBox="{-GRID_THICKNESS_HALF} {-GRID_THICKNESS_HALF} {GRID_WIDTH + GRID_THICKNESS} {GRID_HEIGHT + GRID_THICKNESS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="grid" width={GRID_SCALE} height={GRID_SCALE} patternUnits="userSpaceOnUse">
            <rect width={GRID_SCALE} height={GRID_SCALE} stroke="#000" fill="none" stroke-width={GRID_THICKNESS} />
        </pattern>
    </defs>
    <rect x={-GRID_THICKNESS_HALF} y={-GRID_THICKNESS_HALF} width={GRID_WIDTH + GRID_THICKNESS_HALF} height={GRID_HEIGHT + GRID_THICKNESS_HALF} fill="url(#grid)" stroke="none" />
    <circle cx="150" cy="150" r="50" fill="red" />
</svg>
