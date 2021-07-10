<script lang="ts">
    import type { StateRef } from "../../js/state_manager";
    import { boardState, CONSTRAINT_RENDERERS } from "../../js/board";
    import type { ConstraintRenderer } from "../../js/board";
    import { GRID_THICKNESS, GRID_THICKNESS_HALF } from "../../js/boardUtils";
    import SelectRender from "./element/SelectRender.svelte";
    import { userState, mouseHandlers } from "../../js/user";
    import { derived } from "svelte/store";

    const grid = boardState.ref('grid');

    // TODO somehow update this based on elements.
    const viewBox = derived(grid, $grid => ({
        x: -GRID_THICKNESS_HALF,
        y: -GRID_THICKNESS_HALF,
        width: $grid.width + GRID_THICKNESS,
        height: $grid.height + GRID_THICKNESS,
    }));


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

<svelte:window on:mouseup={e => mouseHandlers.up(e, $grid)} />
<svg id="sudoku" viewBox="{$viewBox.x} {$viewBox.y} {$viewBox.width} {$viewBox.height}" xmlns="http://www.w3.org/2000/svg"
    on:mousedown|capture={e => mouseHandlers.down(e, $grid)}
    on:mousemove|capture={e => mouseHandlers.move(e, $grid)}

    on:click|capture={e => mouseHandlers.click(e, $grid)}
    on:contextmenu|capture={e => mouseHandlers.click(e, $grid)}
>
    <style>
        text {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        text::selection {
            background: none;
        }
    </style>
    <defs>
        {#each list as { id, ref, component } (id)}
            <svelte:component this={component} {id} {ref} grid={$grid} />
        {/each}
    </defs>
    {#each list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>

<style lang="scss">
    svg {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
    }
</style>
