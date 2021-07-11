<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { userState, mouseHandlers } from "../../js/user";

    const grid = boardState.ref('grid');
</script>

<svelte:window on:mouseup={e => mouseHandlers.up(e, $grid)} />
<div>
    <Board {boardState} {userState} />
</div>

<style lang="scss">
    svg {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
    }
</style>
