<script lang="ts">
    import { Board } from "@sudoku-studio/board";
    import { boardDiv, boardState, boardSvg, warningState } from "../../js/board";
    import { currentInputHandler } from "../../js/elementStores";
    import type { InputHandler } from "../../js/input/inputHandler";
    import { userState } from "../../js/user";

    function wrapListener(inputHandler: null | InputHandler, key: keyof InputHandler): (event: any) => void {
        return event => {
            if (null != inputHandler && (document.activeElement === $boardDiv || document.activeElement === document.body))
                inputHandler[key](event);
        };
    }

</script>

<svelte:window
    on:blur={wrapListener($currentInputHandler, 'blur')}
    on:click={event => {
        if (null != $currentInputHandler && document.activeElement !== $boardDiv) {
            $currentInputHandler.blur(event);
        }
    }}
    on:mouseup={wrapListener($currentInputHandler, 'mouseUp')}
    on:touchend={wrapListener($currentInputHandler, 'touchUp')}
    on:keydown={wrapListener($currentInputHandler, 'keydown')}
    on:keyup={wrapListener($currentInputHandler, 'keyup')} />

<div bind:this={$boardDiv} class="overlay" tabindex="0"
    on:mousedown|capture|stopPropagation|preventDefault={event => {
        event.currentTarget.focus();
        return $currentInputHandler && $currentInputHandler.mouseDown(event);
    }}
    on:touchstart|capture|stopPropagation|preventDefault={event => {
        event.currentTarget.focus();
        return $currentInputHandler && $currentInputHandler.touchDown(event);
    }}
    on:mousemove|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'mouseMove')}
    on:touchmove|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'touchMove')}

    on:click|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}
    on:contextmenu|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'click')}

    on:mouseleave|capture|stopPropagation|preventDefault={wrapListener($currentInputHandler, 'leave')}>
</div>
<Board bind:svg={$boardSvg} {boardState} {userState} {warningState} />

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
