<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { userState } from "../../js/user";
    import { mouseHandlers, keydown } from "../../js/input";

    const grid = boardState.ref('grid');

    let svg: SVGSVGElement = null!;
</script>

<svelte:window on:mouseup={e => mouseHandlers.up(e, $grid, svg)} on:keydown={keydown} />
<div class="overlay"
    on:mousedown|capture={e => mouseHandlers.down(e, $grid, svg)}
    on:mousemove|capture={e => mouseHandlers.move(e, $grid, svg)}

    on:click|capture={e => mouseHandlers.click(e, $grid, svg)}
    on:contextmenu|capture={e => mouseHandlers.click(e, $grid, svg)}

    on:mouseleave|capture={e => mouseHandlers.leave(e, $grid, svg)}>
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
