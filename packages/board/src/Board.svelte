<script lang="ts">
    import type * as schema from "./js/schema";
    import type { StateRef } from "sudoku-studio-state-manager";
    import type { ElementRenderer } from "./js/elements";

    import { GRID_THICKNESS, GRID_THICKNESS_HALF } from "./js/utils";
    import { derived } from "svelte/store";
    import { ELEMENT_RENDERERS } from "./js/elements";
    import SelectRender from "./svelte/SelectRender.svelte";

    export let userState: StateRef;
    export let boardState: StateRef;

    const grid = boardState.ref('grid');

    // TODO somehow update this based on elements.
    const viewBox = derived(grid, $grid => ({
        x: -GRID_THICKNESS_HALF,
        y: -GRID_THICKNESS_HALF,
        width: $grid.width + GRID_THICKNESS,
        height: $grid.height + GRID_THICKNESS,
    }));


    type ElementList = { id: string, order: number, ref: StateRef, element: ElementRenderer }[];
    const list: ElementList = [
        { id: 'select', order: 9.5, ref: userState.ref('select'), element: SelectRender }
    ];

    boardState.ref('elements/*').watch<schema.Element>(([ _elements, elementId ], oldVal, newVal) => {
        let i = -1;
        if (null != oldVal) {
            i = list.findIndex(({ id }) => elementId === id);
            if (0 > i) {
                console.error(`Failed to find renderer for constraint with id ${elementId}.`);
                return;
            }
        }

        if (null == newVal) {
            // Deleted.
            delete list[i];
        }
        else {
            const element = ELEMENT_RENDERERS[newVal.type];
            if (null == element) {
                console.error(`Cannot render unknown constraint type: ${newVal.type}.`);
                return;
            }

            const item = {
                id: elementId,
                order: newVal.order,
                ref: boardState.ref(_elements, elementId, 'value'),
                element,
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

<svg id="sudoku" viewBox="{$viewBox.x} {$viewBox.y} {$viewBox.width} {$viewBox.height}" xmlns="http://www.w3.org/2000/svg">
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
        svg * {
            pointer-events: none;
        }
    </style>
    <defs>
        {#each list as { id, ref, element } (id)}
            <svelte:component this={element} {id} {ref} grid={$grid} />
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
