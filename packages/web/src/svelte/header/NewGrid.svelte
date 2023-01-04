<script lang="ts">
    import Modal from "../Modal.svelte";
    import { boardRepr, solutionToString } from "@sudoku-studio/board-utils";
    import { setupUserState } from "../../js/user";
    import { createElement } from "../../js/elements";
    import { fPuzzles } from "@sudoku-studio/board-format";

    export let visible: boolean;

    function resetGrid(dimensions) {
        const newBoardState = boardRepr.createNewBoard(createElement, ...dimensions);
        setupUserState(newBoardState);
        boardState.update(newBoardState as any);
        visible = false;
    }
</script>

<Modal bind:visible={visible}>
    <div class="size-choices">
        <ol class="nolist">
            {#each Object.entries(fPuzzles.fpuzzlesSizes) as [size, dimensions]}
                <li>
                    <button class="size-item nobutton" on:click={() => resetGrid(dimensions)}>
                        {size}x{size}
                    </button>
                </li>
            {/each}
        </ol>
    </div>
</Modal>

<style lang="scss">
    @use '../../css/vars' as vars;

    .size-choices {
        height: 75vh;
        overflow: auto;
    }

    .size-item {
        width: 100%;
        margin: 0.25em 0 0 0;
        padding: 0.25em;
        text-align: inherit;

        @include vars.hoverborder();
        &:hover, &:focus-visible {
            @include vars.hoverborder-hover();
        }
    }
</style>
