<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { PointerHandler } from "../../js/pointerHandler";
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { userState } from "../../js/user";
    import { keydown } from "../../js/input";
    import { ELEMENT_HANDLERS } from "../../js/elements";
    import { derived } from "svelte/store";

    const grid = boardState.ref('grid');
    const toolId = userState.ref('tool');

    const pointerHandler = derived<StateRef, null | PointerHandler>(toolId, $toolId => {
        // TODO FIXME.
        const ref = boardState.ref('elements', $toolId, 'value');
        const type = boardState.get<string>('elements', $toolId, 'type');
        if (null == type) return null;
        const ElementHandler = ELEMENT_HANDLERS[type];
        if (null == ElementHandler) return null;
        return (new ElementHandler(ref, null)).pointerHandler;
    });

    let svg: SVGSVGElement = null!; // Assigned on load.
</script>

<svelte:window on:mouseup={e => $pointerHandler && $pointerHandler.up(e, $grid, svg)} on:keydown={keydown} />
<div class="overlay"
    on:mousedown|capture|stopPropagation|preventDefault={e => $pointerHandler && $pointerHandler.down(e, $grid, svg)}
    on:mousemove|capture|stopPropagation|preventDefault={e => $pointerHandler && $pointerHandler.move(e, $grid, svg)}

    on:click|capture|stopPropagation|preventDefault={e => $pointerHandler && $pointerHandler.click(e, $grid, svg)}
    on:contextmenu|capture|stopPropagation|preventDefault={e => $pointerHandler && $pointerHandler.click(e, $grid, svg)}

    on:mouseleave|capture|stopPropagation|preventDefault={e => $pointerHandler && $pointerHandler.leave(e, $grid, svg)}>
</div>
<Board {boardState} {userState} bind:svg={svg} />

<style lang="scss">
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        cursor: pointer;
    }
</style>
