<script lang="ts">
    import type { StateManager } from '@sudoku-studio/state-manager/src';
    import { Board, type BoardElement } from '@sudoku-studio/board/src';
    import { boardDiv, boardGridRef, boardSvg, warningState } from '$lib/js/board';
    import { currentInputHandler } from '$lib/js/elementStores';
    import type { inputHandler } from '@sudoku-studio/elements/src';
    import { userState } from '$lib/js/user';
    import type { schema } from '@sudoku-studio/schema';
    import { derived, readable } from 'svelte/store';
    import { getBorderPath, getDigits, idxMapToKeysArray } from '@sudoku-studio/board-utils/src';
    import { ELEMENT_HANDLERS } from '$lib/js/elements';
    import SelectRender from '$lib/js/element/SelectRender.svelte';
    import CursorRender from '$lib/js/element/CursorRender.svelte';

    function wrapListener(
        inputHandler: null | inputHandler.InputHandler,
        key: keyof inputHandler.InputHandler,
    ): (event: any) => void {
        return (event) => {
            if (
                null != inputHandler &&
                (document.activeElement === $boardDiv || document.activeElement === document.body)
            )
                inputHandler[key](event);
        };
    }

    export let boardState: StateManager<schema.Board>;

    const elementsRef = boardState.ref<schema.Board['elements']>('elements');
    const givensMaskPath = derived(
        [elementsRef, boardGridRef],
        ([elements, grid]) =>
            getBorderPath(idxMapToKeysArray(getDigits(elements || {}, true, false)), grid!) || undefined,
    );
    const givensFilledMaskPath = derived(
        [elementsRef, boardGridRef],
        ([elements, grid]) =>
            getBorderPath(idxMapToKeysArray(getDigits(elements || {}, true, true)), grid!) || undefined,
    );

    const elements = readable<BoardElement[]>([], (set) => {
        const list: (BoardElement & { order: number })[] = [];
        if (null != userState) {
            list.push(
                {
                    id: 'select_192839012', // TODO
                    order: 95, // TODO
                    ref: userState.ref('select'), // TODO
                    component: SelectRender,
                    margin: 0,
                },
                {
                    id: 'cursor_192839012', // TODO
                    order: 94, // TODO
                    ref: userState.ref('cursor'), // TODO
                    component: CursorRender,
                    margin: 0,
                },
            );
        }
        if (null != warningState) {
            list.push({
                id: 'warning_19282093', // TODO
                order: 94,
                ref: warningState.ref('cells'),
                component: (internals, props) =>
                    SelectRender(
                        internals,
                        Object.assign(props, { fill: '#f33', outlineOpacity: '#eee', innerOpacity: '#333' }),
                    ),
                margin: 0,
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
                const elementInfo = ELEMENT_HANDLERS[type];
                if (null == elementInfo) {
                    console.warn(`Cannot render unknown constraint type: ${type}.`);
                    return;
                }

                const item = {
                    id: elementId,
                    ref: boardState.ref<any>(_elements, elementId, 'value'),
                    component: elementInfo.component,
                    margin: elementInfo.margin || 0,
                    order: newVal.order,
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
</script>

<svelte:window
    on:blur={wrapListener($currentInputHandler, 'blur')}
    on:click={(event) => {
        if (null != $currentInputHandler && document.activeElement !== $boardDiv) {
            $currentInputHandler.blur(event);
        }
    }}
    on:mouseup={wrapListener($currentInputHandler, 'mouseUp')}
    on:touchend={wrapListener($currentInputHandler, 'touchUp')}
    on:keydown={wrapListener($currentInputHandler, 'keydown')}
    on:keyup={wrapListener($currentInputHandler, 'keyup')}
/>

<div
    bind:this={$boardDiv}
    class="overlay"
    tabindex="0"
    role="grid"
    on:mousedown|capture|stopPropagation|preventDefault={(event) => {
        event.currentTarget.focus();
        return $currentInputHandler && $currentInputHandler.mouseDown(event);
    }}
    on:touchstart|capture|stopPropagation|preventDefault={(event) => {
        event.currentTarget.focus();
        return $currentInputHandler && $currentInputHandler.touchDown(event);
    }}
    on:mousemove|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'mouseMove')}
    on:touchmove|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'touchMove')}
    on:click|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}
    on:contextmenu|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}
    on:mouseleave|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'leave')}
></div>
<Board bind:svg={$boardSvg} grid={$boardGridRef!} elements={$elements}>
    <mask id="SUDOKU_MASK_GIVENS" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={$boardGridRef?.width} height={$boardGridRef?.height} fill="#fff" />
        <path d={$givensMaskPath} fill="#000" stroke="none" />
    </mask>
    <mask id="SUDOKU_MASK_GIVENS_FILLED" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width={$boardGridRef?.width} height={$boardGridRef?.height} fill="#fff" />
        <path d={$givensFilledMaskPath} fill="#000" stroke="none" />
    </mask>
</Board>

<style lang="scss">
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        cursor: pointer;
    }
    .overlay:focus {
        outline: none;
    }
</style>
