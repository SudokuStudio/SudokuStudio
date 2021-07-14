<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { userState } from "../../js/user";
    import { keydown, thermoPointerHandler as pointerHandler } from "../../js/input";

    const grid = boardState.ref('grid');

    let svg: SVGSVGElement = null!;
</script>

<svelte:window on:mouseup={e => pointerHandler.up(e, $grid, svg)} on:keydown={keydown} />
<div class="overlay"
    on:mousedown|capture|stopPropagation|preventDefault={e => pointerHandler.down(e, $grid, svg)}
    on:mousemove|capture|stopPropagation|preventDefault={e => pointerHandler.move(e, $grid, svg)}

    on:click|capture|stopPropagation|preventDefault={e => pointerHandler.click(e, $grid, svg)}
    on:contextmenu|capture|stopPropagation|preventDefault={e => pointerHandler.click(e, $grid, svg)}

    on:mouseleave|capture|stopPropagation|preventDefault={e => pointerHandler.leave(e, $grid, svg)}>
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
