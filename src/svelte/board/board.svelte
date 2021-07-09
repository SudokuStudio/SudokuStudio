<script lang="ts">
    import type { StateManager, StateRef } from "../../js/state_manager";
    import { CONSTRAINT_RENDERERS } from "../../js/board";
    import type { ConstraintRenderer } from "../../js/board";
    import { GRID_THICKNESS, GRID_THICKNESS_HALF } from "../../js/boardUtils";
    import SelectRender from "./element/SelectRender.svelte";

    export let boardState: StateManager;
    export let userState: StateManager;
    export let boardOnClick: (event: MouseEvent & { currentTarget: EventTarget & SVGSVGElement }, grid: { width: number, height: number }) => void;

    const grid = boardState.ref('grid');

    type ConstraintList = { id: string, order: number, ref: StateRef, component: ConstraintRenderer }[];
    const list: ConstraintList = [
        { id: 'select', order: 9.5, ref: userState.ref('select'), component: SelectRender }
    ];

    boardState.ref('elements/*').watch<schema.Element>(([ _elements, constraintId ], oldVal, newVal) => {
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

<svg id="sudoku" viewBox="{-GRID_THICKNESS_HALF} {-GRID_THICKNESS_HALF} {$grid.width + GRID_THICKNESS} {$grid.height + GRID_THICKNESS}"
    xmlns="http://www.w3.org/2000/svg" on:click={e => boardOnClick(e, $grid)}
>
    <defs>
        {#each list as { id, ref, component } (id)}
            <svelte:component this={component} {id} {ref} grid={$grid} />
        {/each}
    </defs>
    {#each list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
