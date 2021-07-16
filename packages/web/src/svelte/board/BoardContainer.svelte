<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardState } from "../../js/board";
    import { boardSvg, currentInputHandler } from "../../js/elementStores";
    import type { InputHandler } from "../../js/input/inputHandler";
    import { userState } from "../../js/user";

    let overlay: HTMLDivElement = null!;
    function wrapListener(inputHandler: null | InputHandler, key: keyof InputHandler): (event: any) => void {
        return event => {
            if (null != inputHandler && document.activeElement === overlay)
                inputHandler[key](event);
        };
    }

</script>

<svelte:window
    on:mouseup={wrapListener($currentInputHandler, 'up')}
    on:keydown={wrapListener($currentInputHandler, 'keydown')}
    on:keyup={wrapListener($currentInputHandler, 'keyup')} />

<div bind:this={overlay} class="overlay" tabindex="0"
    on:mousedown={(e) => e.currentTarget.focus()}

    on:mousedown|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'down')}
    on:mousemove|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'move')}

    on:click|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}
    on:contextmenu|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}

    on:mouseleave|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'leave')}>
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
