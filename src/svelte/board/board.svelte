<script lang="ts">
    import type { StateManager, StateRef } from "../../js/state_manager";
    import { CONSTRAINT_RENDERERS } from "../../js/board";
    import type { ConstraintRenderer } from "../../js/board";
    import { GRID_SCALE, GRID_THICKNESS, GRID_THICKNESS_HALF } from "../../js/consts";

    export let boardState: StateManager;

    const grid = boardState.ref('grid');

    type ConstraintList = { id: string, ref: StateRef, component: ConstraintRenderer }[];
    const list: ConstraintList = [];

    boardState.ref('constraints/*').watch<schema.Constraint>(([ constraints, constraintId ], oldVal, newVal) => {
        if (null == newVal) {
            // Deleted.
            const i = list.findIndex(({ id }) => constraintId === id);
            if (0 > i) throw Error(`Failed to find constraint with id ${constraintId}.`);
            delete list[i];
        }
        else {
            const component = CONSTRAINT_RENDERERS[newVal.type];
            if (null == component) {
                console.error(`Cannot render unknown constraint type: ${newVal.type}.`);
                return;
            }

            if (null == oldVal) {
                list.push({
                    id: constraintId,
                    ref: boardState.ref(constraints, constraintId, 'value'),
                    component,
                });
            }
            else {
                if (oldVal.type !== newVal.type)
                    console.error('Cannot change type of constraint!');
                // TODO: handle metadata?
            }
        }
    }, true);
</script>

<svg id="sudoku" viewBox="{-GRID_THICKNESS_HALF} {-GRID_THICKNESS_HALF} {GRID_SCALE * $grid.width + GRID_THICKNESS} {GRID_SCALE * $grid.height + GRID_THICKNESS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="grid" width={GRID_SCALE} height={GRID_SCALE} patternUnits="userSpaceOnUse">
            <rect width={GRID_SCALE} height={GRID_SCALE} stroke="#000" fill="none" stroke-width={GRID_THICKNESS} />
        </pattern>
        {#each list as { id, ref, component } (id)}
            <svelte:component this={component} {id} {ref} grid={$grid} />
        {/each}
    </defs>
    <rect x={-GRID_THICKNESS_HALF} y={-GRID_THICKNESS_HALF} width={GRID_SCALE * $grid.width + GRID_THICKNESS_HALF} height={GRID_SCALE * $grid.height + GRID_THICKNESS_HALF} fill="url(#grid)" stroke="none" />
    {#each list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
