<script lang="ts" context="module">
    import GridRender from './svelte/GridRender.svelte';
    import BoxRender from './svelte/BoxRender.svelte';
    import DigitRender from './svelte/DigitRender.svelte';
    import ThermoRender from './svelte/ThermoRender.svelte';
    import ArrowRender from './svelte/ArrowRender.svelte';
    import MinRender from './svelte/MinRender.svelte';
    import MaxRender from './svelte/MaxRender.svelte';
    import KillerRender from './svelte/KillerRender.svelte';
    import QuadrupleRender from './svelte/QuadrupleRender.svelte';
    import DiagonalRender from './svelte/DiagonalRender.svelte';
    import UserRender from './svelte/UserRender.svelte';
    import CornerRender from './svelte/CornerRender.svelte';
    import CenterRender from './svelte/CenterRender.svelte';
    import ColorsRender from './svelte/ColorsRender.svelte';

    function FilledRender(args: any) {
        args.props.color = '#4e72b0';
        args.props.mask = 'url(#SUDOKU_MASK_GIVENS)';
        return new DigitRender(args);
    }

    export type ElementRenderer = NonNullable<typeof ELEMENT_RENDERERS[keyof typeof ELEMENT_RENDERERS]>;
    export const ELEMENT_RENDERERS = {
        ['grid']: GridRender,
        ['box']: BoxRender,

        ['givens']: DigitRender,
        ['filled']: FilledRender,
        ['corner']: CornerRender,
        ['center']: CenterRender,
        ['colors']: ColorsRender,

        ['thermo']: ThermoRender,
        ['arrow']: ArrowRender,
        ['sandwich']: null,
        ['min']: MinRender,
        ['max']: MaxRender,
        ['killer']: KillerRender,
        ['quadruple']: QuadrupleRender,

        ['diagonal']: DiagonalRender,
        ['knight']: null,
        ['king']: null,
        ['disjointGroups']: null,
        ['consecutive']: null,
    } as const;
</script>
<script lang="ts">
    import type { schema } from "@sudoku-studio/schema";
    import type { StateManager, StateRef } from "@sudoku-studio/state-manager";

    import { bitsetToList, getDigits, getEdges, GRID_THICKNESS, GRID_THICKNESS_HALF } from "@sudoku-studio/board-utils";
    import { derived } from "svelte/store";

    export let userState: StateManager;
    export let boardState: StateManager;
    export let svg: SVGSVGElement = null!;


    const grid = boardState.ref('grid');

    const elementsRef = boardState.ref('elements');
    const givensMaskPath = derived([ elementsRef, grid ], ([ elements, grid ]) =>
        getEdges(bitsetToList(getDigits(elements || {}, true, false)), grid, 0) || undefined);
    const givensFilledMaskPath = derived([ elementsRef, grid ], ([ elements, grid ]) =>
        getEdges(bitsetToList(getDigits(elements || {}, true, true)), grid, 0) || undefined);

    // TODO somehow update this based on elements.
    const viewBox = derived(grid, $grid => ({
        x: -GRID_THICKNESS_HALF,
        y: -GRID_THICKNESS_HALF,
        width: $grid.width + GRID_THICKNESS,
        height: $grid.height + GRID_THICKNESS,
    }));


    type ElementList = { id: string, order: number, ref: StateRef, element: ElementRenderer }[];
    const list: ElementList = [
        { id: 'select', order: 9.5, ref: userState as any /* TODO */, element: UserRender }
    ];

    boardState.ref('elements/*').watch<schema.Element>(([ _elements, elementId ], oldVal, newVal) => {
        let i = -1;
        if (null != oldVal) {
            if (null == ELEMENT_RENDERERS[oldVal.type]) return;

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
                console.warn(`Cannot render unknown constraint type: ${newVal.type}.`);
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

<svg bind:this={svg} viewBox="{$viewBox.x} {$viewBox.y} {$viewBox.width} {$viewBox.height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        svg {
            -webkit-tap-highlight-color: transparent;
            touch-action: none;
        }
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
        .hide {
            display: none;
        }
    </style>
    <defs>
        <mask id="SUDOKU_MASK_GIVENS" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={$grid.width} height={$grid.height} fill="#fff" />
            <path d={$givensMaskPath} fill="#000" stroke="none" />
        </mask>
        <mask id="SUDOKU_MASK_GIVENS_FILLED" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={$grid.width} height={$grid.height} fill="#fff" />
            <path d={$givensFilledMaskPath} fill="#000" stroke="none" />
        </mask>
        {#each list as { id, ref, element } (id)}
            <svelte:component this={element} {id} {ref} grid={$grid} />
        {/each}
    </defs>
    {#each list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
