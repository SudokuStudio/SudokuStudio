<script lang="ts">
    import type { PointerHandler } from "../../js/element/pointerHandler";
    import { Board } from "@sudoku-studio/board";
    import { boardState, elementHandlerItem } from "../../js/board";
    import { userState } from "../../js/user";
    import { keydown } from "../../js/input";
    import { derived } from "svelte/store";

    const grid = boardState.ref('grid');

    const pointerHandler = derived<typeof elementHandlerItem, null | PointerHandler>(elementHandlerItem,
        $elementHandlerItem => $elementHandlerItem?.handler?.pointerHandler || null);

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
