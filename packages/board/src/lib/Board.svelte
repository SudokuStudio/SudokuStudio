<script lang="ts" module>
    import type { Component, Snippet } from 'svelte';
    import type { Grid } from '@sudoku-studio/schema';
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { ElementComponentProps } from '@sudoku-studio/elements/src';

    export type BoardElement = {
        id: string;
        ref: StateRef<any>;
        component: Component<ElementComponentProps<any>>;
        margin: number;
    };
</script>

<script lang="ts">
    let {
        svg = $bindable(),
        grid,
        elements,
        children,
    }: { svg: SVGSVGElement; grid: Grid; elements: BoardElement[]; children?: Snippet } = $props();

    const margin = $derived(elements.map(({ margin }) => margin).reduce((a, b) => (a > b ? a : b), 0));
    const viewBox = $derived({
        x: -margin,
        y: -margin,
        width: grid.width + 2 * margin,
        height: grid.height + 2 * margin,
    });
</script>

<svg
    bind:this={svg}
    viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
    xmlns="http://www.w3.org/2000/svg"
>
    <style>
        svg {
            font-family: 'Mulish', 'Muli', sans-serif;
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
        {@render children?.()}
        {#each elements as { id, ref, component: Component } (id)}
            <Component {id} {ref} {grid} />
        {/each}
    </defs>
    {#each elements as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
