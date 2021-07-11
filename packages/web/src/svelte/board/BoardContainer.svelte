<script lang="ts">
    import * as Board from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { userState, mouseHandlers } from "../../js/user";
</script>

<svelte:window on:mouseup={e => mouseHandlers.up(e, $grid)} />

<style lang="scss">
    svg {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
    }
</style>
