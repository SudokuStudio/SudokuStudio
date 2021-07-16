<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { boardSvg, currentInputHandler } from "../../js/elementStores";
    import { userState } from "../../js/user";
</script>

<svelte:window on:mouseup={$currentInputHandler && $currentInputHandler.up || undefined} />
<div class="overlay"
    on:mousedown|capture|stopPropagation|preventDefault={$currentInputHandler && $currentInputHandler.down || undefined}
    on:mousemove|capture|stopPropagation|preventDefault={$currentInputHandler && $currentInputHandler.move || undefined}

    on:click|capture|stopPropagation|preventDefault={$currentInputHandler && $currentInputHandler.click || undefined}
    on:contextmenu|capture|stopPropagation|preventDefault={$currentInputHandler && $currentInputHandler.click || undefined}

    on:mouseleave|capture|stopPropagation|preventDefault={$currentInputHandler && $currentInputHandler.leave || undefined}>
</div>
<Board bind:svg={$boardSvg} {boardState} {userState} />

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
