<script lang="ts" context="module">
    import type { Component, ComponentProps } from 'svelte';
    import type { Geometry, Grid, Idx, IdxBitset, schema, user } from '@sudoku-studio/schema';
    import type { StateManager, StateRef } from '@sudoku-studio/state-manager/src';

    import { derived, readable } from 'svelte/store';
    import {
        idxMapToKeysArray,
        GRID_REGION_THICKNESS_HALF,
        edgeIdx2svgCoord,
        getDigits,
        getBorderPath,
        GRID_THICKNESS_HALF,
        num2roman,
        seriesIdx2seriesCoord,
    } from '@sudoku-studio/board-utils/src';

    import SelectRender from './svelte/SelectRender.svelte';
    import CursorRender from './svelte/CursorRender.svelte';

    import GridRender from './svelte/GridRender.svelte';
    import GridRegionRender from './svelte/GridRegionRender.svelte';
    import DigitRender from './svelte/DigitRender.svelte';

    import ThermoRender from './svelte/ThermoRender.svelte';
    import BetweenRender from './svelte/BetweenRender.svelte';
    import DoubleArrowRender from './svelte/DoubleArrowRender.svelte';
    import LockoutRender from './svelte/LockoutRender.svelte';
    import ArrowRender from './svelte/ArrowRender.svelte';
    import LineRender from './svelte/LineRender.svelte';

    import MinRender from './svelte/MinRender.svelte';
    import MaxRender from './svelte/MaxRender.svelte';
    import OddRender from './svelte/OddRender.svelte';
    import EvenRender from './svelte/EvenRender.svelte';
    import IndexerRender from './svelte/IndexerRender.svelte';

    import KillerRender from './svelte/KillerRender.svelte';
    import QuadrupleRender from './svelte/QuadrupleRender.svelte';
    import DiagonalRender from './svelte/DiagonalRender.svelte';
    import CornerRender from './svelte/CornerRender.svelte';
    import CenterRender from './svelte/CenterRender.svelte';
    import ColorsRender from './svelte/ColorsRender.svelte';
    import PositionNumberRender from './svelte/PositionNumberRender.svelte';
    import LittleKillerRender from './svelte/LittleKillerRender.svelte';
    import NullRender from './svelte/NullRender.svelte';
    import CloneRender from './svelte/CloneRender.svelte';

    const WarningRender: Component<ComponentProps<typeof SelectRender>> = (internals, props) =>
        SelectRender(internals, Object.assign(props, { fill: '#f33', outlineOpacity: '#eee', innerOpacity: '#333' }));

    const FilledRender: Component<ComponentProps<typeof DigitRender>> = (internals, props) =>
        DigitRender(internals, Object.assign(props, { color: '#4e72b0', mask: 'url(#SUDOKU_MASK_GIVENS)' }));

    const DifferenceRender: Component<ComponentProps<typeof PositionNumberRender>> = (internals, props) =>
        PositionNumberRender(
            internals,
            Object.assign(props, {
                idx2coord: edgeIdx2svgCoord,
                stroke: '#242424',
                fill: '#fff',
                textColor: '#000',
                strokeWidth: 0.02,
            }),
        );

    const RatioRender: Component<ComponentProps<typeof PositionNumberRender>> = (internals, props) =>
        PositionNumberRender(
            internals,
            Object.assign(props, { idx2coord: edgeIdx2svgCoord, stroke: 'none', fill: '#000', textColor: '#fff' }),
        );

    const XVRender: Component<ComponentProps<typeof PositionNumberRender>> = (internals, props) =>
        PositionNumberRender(
            internals,
            Object.assign(props, {
                idx2coord: edgeIdx2svgCoord,
                stroke: 'none',
                fill: '#fff',
                textColor: '#000',
                radius: 0.17,
                fontSize: 0.3,
                fontWeight: 800,
                mapDigits: (num: true | number) => (true !== num ? num2roman(num) : '_'),
            }),
        );

    const SeriesRender: Component<ComponentProps<typeof PositionNumberRender>> = (internals, props) =>
        PositionNumberRender(
            internals,
            Object.assign(props, {
                idx2coord: (idx: Idx<Geometry.SERIES>, grid: Grid) => {
                    const [x, y] = seriesIdx2seriesCoord(idx, grid);
                    return [x + 0.5, y + 0.5];
                },
                radius: 0,
                textColor: '#000',
                fontSize: 0.5,
                mapDigits: (num: true | number) => (true !== num ? `${num}` : '_'),
            }),
        );

    const PalindromeRender: Component<ComponentProps<typeof LineRender>> = (internals, props) =>
        LineRender(internals, Object.assign(props, { stroke: '#ed8', strokeWidth: 0.125 }));

    const GermanWhisperRender: Component<ComponentProps<typeof LineRender>> = (internals, props) =>
        LineRender(
            internals,
            Object.assign(props, {
                stroke: '#8c8',
                strokeWidth: 0.1,
                pathOptions: { shortenHead: 0.15, shortenTail: 0.15, bezierRounding: 0.15, closeLoops: true },
            }),
        );

    const DutchWhisperRender: Component<ComponentProps<typeof LineRender>> = (internals, props) =>
        LineRender(
            internals,
            Object.assign(props, {
                stroke: '#ff8c00',
                strokeWidth: 0.1,
                pathOptions: { shortenHead: 0.15, shortenTail: 0.15, bezierRounding: 0.15, closeLoops: true },
            }),
        );

    const RenbanRender: Component<ComponentProps<typeof LineRender>> = (internals, props) =>
        LineRender(
            internals,
            Object.assign(props, {
                stroke: '#c8c',
                strokeWidth: 0.075,
                pathOptions: { shortenHead: 0.15, shortenTail: 0.15, bezierRounding: 0.15, closeLoops: true },
            }),
        );

    const RegionSumRender: Component<ComponentProps<typeof LineRender>> = (internals, props) =>
        LineRender(
            internals,
            Object.assign(props, {
                stroke: '#2ECBFF',
                strokeWidth: 0.125,
                pathOptions: { shortenHead: 0.15, shortenTail: 0.15, bezierRounding: 0.15, closeLoops: true },
            }),
        );

    const SlowThermoRender: Component<ComponentProps<typeof ThermoRender>> = (internals, props) =>
        ThermoRender(internals, Object.assign(props, { isSlow: true }));

    const ColumnIndexerRender: Component<ComponentProps<typeof IndexerRender>> = (internals, props) =>
        IndexerRender(internals, Object.assign(props, { color: '#C77C7C' }));

    const RowIndexerRender: Component<ComponentProps<typeof IndexerRender>> = (internals, props) =>
        IndexerRender(internals, Object.assign(props, { color: '#7CC77C' }));

    export type ElementRenderer = NonNullable<(typeof ELEMENT_RENDERERS)[keyof typeof ELEMENT_RENDERERS]>;
    export const ELEMENT_RENDERERS = {
        ['select']: SelectRender,
        ['cursor']: CursorRender,
        ['warning']: WarningRender,

        ['grid']: GridRender,
        ['gridRegion']: GridRegionRender,

        ['givens']: DigitRender,
        ['filled']: FilledRender,
        ['corner']: CornerRender,
        ['center']: CenterRender,
        ['colors']: ColorsRender,

        ['thermo']: ThermoRender,
        ['slowThermo']: SlowThermoRender,
        ['between']: BetweenRender,
        ['lockout']: LockoutRender,
        ['doubleArrow']: DoubleArrowRender,
        ['palindrome']: PalindromeRender,
        ['whisper']: GermanWhisperRender,
        ['dutchWhisper']: DutchWhisperRender,
        ['renban']: RenbanRender,
        ['regionSum']: RegionSumRender,
        ['arrow']: ArrowRender,

        ['min']: MinRender,
        ['max']: MaxRender,
        ['odd']: OddRender,
        ['even']: EvenRender,
        ['columnIndexer']: ColumnIndexerRender,
        ['rowIndexer']: RowIndexerRender,

        ['killer']: KillerRender,
        ['clone']: CloneRender,

        ['quadruple']: QuadrupleRender,
        ['difference']: DifferenceRender,
        ['ratio']: RatioRender,
        ['xv']: XVRender,

        ['littleKiller']: LittleKillerRender,
        ['sandwich']: SeriesRender,
        ['xsum']: SeriesRender,
        ['skyscraper']: SeriesRender,

        ['diagonal']: DiagonalRender,

        ['knight']: NullRender,
        ['king']: NullRender,
        ['disjointGroups']: NullRender,
        ['consecutive']: NullRender,
        ['antiX']: NullRender,
        ['antiV']: NullRender,
        ['selfTaxicab']: NullRender,
    } as const;

    // TODO denormalize this.
    const MARGINS = {
        ['grid']: GRID_THICKNESS_HALF,
        ['gridRegion']: GRID_REGION_THICKNESS_HALF,

        ['sandwich']: 1,
        ['xsum']: 1,
        ['skyscraper']: 1,
        ['littleKiller']: 0.9,
    } as { [K in keyof typeof ELEMENT_RENDERERS]?: number };
</script>

<script lang="ts">
    export let userState: undefined | null | StateManager<user.UserState>;
    export let warningState: undefined | null | StateManager<IdxBitset<Geometry.CELL>>;
    export let boardState: StateManager<schema.Board>;
    export let svg: SVGSVGElement = null!;

    const grid = boardState.ref<Grid>('grid');
    grid.watch((_grid, old, news) => console.log('grid watch', old, news), true);

    const elementsRef = boardState.ref<schema.Board['elements']>('elements');
    const givensMaskPath = derived(
        [elementsRef, grid],
        ([elements, grid]) =>
            getBorderPath(idxMapToKeysArray(getDigits(elements || {}, true, false)), grid!) || undefined,
    );
    const givensFilledMaskPath = derived(
        [elementsRef, grid],
        ([elements, grid]) =>
            getBorderPath(idxMapToKeysArray(getDigits(elements || {}, true, true)), grid!) || undefined,
    );

    type ElementList<T extends keyof typeof ELEMENT_RENDERERS = any> = {
        id: string;
        type: T;
        order: number;
        ref: StateRef<ComponentProps<(typeof ELEMENT_RENDERERS)[T]>>;
        element: (typeof ELEMENT_RENDERERS)[T];
    }[];

    const list = readable<ElementList>([], (set) => {
        const list: ElementList = [];
        if (null != userState) {
            list.push(
                {
                    id: 'select_192839012', // TODO
                    type: 'select',
                    order: 95, // TODO
                    ref: userState.ref('select'), // TODO
                    element: SelectRender,
                },
                {
                    id: 'cursor_192839012', // TODO
                    type: 'cursor',
                    order: 94, // TODO
                    ref: userState.ref('cursor'), // TODO
                    element: CursorRender,
                },
            );
        }
        if (null != warningState) {
            list.push({
                id: 'warning_19282093', // TODO
                type: 'warning',
                order: 94,
                ref: warningState.ref('cells'),
                element: WarningRender,
            });
        }

        boardState.ref<schema.Element>('elements/*').watch(([_elements, elementId], oldVal, newVal) => {
            const type = oldVal?.type || newVal?.type;

            // Element has been deleted via undo/redo
            if (null == type) return;

            let i = -1;
            if (null != oldVal) {
                i = list.findIndex(({ id }) => elementId === id);
                if (0 > i) {
                    console.error(`Failed to find renderer for constraint with id ${elementId}.`);
                    return;
                }
            }

            // `newVal` is null when deleting manually
            // `newVal.type` is null when deleting via undo/redo
            // TODO(mingwei): why is this the case?
            if (null == newVal || null == newVal.type) {
                // Deleted.
                list.splice(i, 1);
            } else {
                const element = ELEMENT_RENDERERS[type];
                if (null == element) {
                    console.warn(`Cannot render unknown constraint type: ${type}.`);
                    return;
                }

                const item = {
                    id: elementId,
                    type,
                    order: newVal.order,
                    ref: boardState.ref<any>(_elements, elementId, 'value'),
                    element,
                };

                if (null == oldVal) {
                    list.push(item);
                } else {
                    if (oldVal.type !== newVal.type) console.error('Cannot change type of constraint!');
                    list[i] = item;
                }
            }
            list.sort((a, b) => a.order - b.order);
            set(list);
        }, true);
    });

    // TODO somehow update this based on elements.
    const viewBox = derived([grid, list], ([$grid, $list]) => {
        const margin = $list
            .map(({ type }) => MARGINS[type as keyof typeof ELEMENT_RENDERERS] || 0)
            .filter<number>((margin): margin is number => null != margin)
            .reduce((a, b) => (a > b ? a : b), 0);
        return { x: -margin, y: -margin, width: $grid!.width + 2 * margin, height: $grid!.height + 2 * margin };
    });
</script>

<svg
    bind:this={svg}
    viewBox="{$viewBox.x} {$viewBox.y} {$viewBox.width} {$viewBox.height}"
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
        <mask id="SUDOKU_MASK_GIVENS" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={$grid?.width} height={$grid?.height} fill="#fff" />
            <path d={$givensMaskPath} fill="#000" stroke="none" />
        </mask>
        <mask id="SUDOKU_MASK_GIVENS_FILLED" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={$grid?.width} height={$grid?.height} fill="#fff" />
            <path d={$givensFilledMaskPath} fill="#000" stroke="none" />
        </mask>
        {#each $list as { id, ref, element: Element } (id)}
            <Element {id} {ref} grid={$grid} />
        {/each}
    </defs>
    {#each $list as { id } (id)}
        <use href="#{id}" />
    {/each}
</svg>
