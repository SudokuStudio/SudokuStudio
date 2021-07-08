<script lang="ts">
    import type { StateManager, StateRef } from "../../js/state_manager";
    import { CONSTRAINT_RENDERERS } from "../../js/board";
    import type { ConstraintRenderer } from "../../js/board";
    import { GRID_THICKNESS, GRID_THICKNESS_HALF } from "../../js/boardUtils";

    export let boardState: StateManager;

    const grid = boardState.ref('grid');

    type ConstraintList = { id: string, order: number, ref: StateRef, component: ConstraintRenderer }[];
    const list: ConstraintList = [];

    boardState.ref('elements/*').watch<schema.Constraint>(([ _elements, constraintId ], oldVal, newVal) => {
        let i = -1;
        if (null != oldVal) {
            i = list.findIndex(({ id }) => constraintId === id);
            if (0 > i) {
                console.error(`Failed to find renderer for constraint with id ${constraintId}.`);
                return;
            }
        }

        if (null == newVal) {
            // Deleted.
            delete list[i];
        }
        else {
            const component = CONSTRAINT_RENDERERS[newVal.type];
            if (null == component) {
                console.error(`Cannot render unknown constraint type: ${newVal.type}.`);
                return;
            }

            const item = {
                id: constraintId,
                order: newVal.order,
                ref: boardState.ref(_elements, constraintId, 'value'),
                component,
            };

            if (null == oldVal) {
                list.push(item);
            }
            else {
                if (oldVal.type !== newVal.type)
                    console.error('Cannot change type of constraint!');
                list[i] = item;
            }
        }
        list.sort((a, b) => a.order - b.order);
    }, true);
</script>

<svg id="sudoku" viewBox="{-GRID_THICKNESS_HALF} {-GRID_THICKNESS_HALF} {$grid.width + GRID_THICKNESS} {$grid.height + GRID_THICKNESS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" stroke="#000" fill="none" stroke-width={GRID_THICKNESS} />
        </pattern>
        {#each list as { id, ref, component } (id)}
            <svelte:component this={component} {id} {ref} grid={$grid} />
        {/each}
    </defs>
    <rect x={-GRID_THICKNESS_HALF} y={-GRID_THICKNESS_HALF} width={$grid.width + GRID_THICKNESS_HALF} height={$grid.height + GRID_THICKNESS_HALF} fill="url(#grid)" stroke="none" />
    {#each list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
