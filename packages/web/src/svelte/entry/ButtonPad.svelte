<script lang="ts">
    import { TOOL_INPUT_NAME, userToolState, userState } from "../../js/user";
    import { currentInputHandler } from "../../js/board";

    // Button ripples.
    import { MDCRipple } from "@material/ripple";
    import { onMount } from "svelte";
    onMount(() => Array.prototype.forEach.call(document.getElementsByClassName('mdc-ripple-surface'), el => MDCRipple.attachTo(el)));

    const filled = userState.ref('marks', 'filled');
    const corner = userState.ref('marks', 'corner');
    const center = userState.ref('marks', 'center');
    const colors = userState.ref('marks', 'colors');
</script>

<svelte:window
    on:keydown={$currentInputHandler && $currentInputHandler.keydown || undefined}
    on:keyup={$currentInputHandler && $currentInputHandler.keyup || undefined} />
<div class="container">
    <div class="mode-pad-container">
        <div class="mode-pad">
            <!-- TOOD switch to INPUT RADIOs. -->
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-digits" value={$filled} bind:group={$userToolState} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-digits">
                    <span aria-hidden="true">1</span>
                    <span class="sr-only">Digits</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-corner" value={$corner} bind:group={$userToolState} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-corner">
                    <span aria-hidden="true" style="font-size: 50%;">
                        <span style="position: absolute; top:    12%; left:  20%;">1</span>
                        <span style="position: absolute; top:    12%; right: 20%;">2</span>
                        <span style="position: absolute; bottom: 12%; left:  20%;">3</span>
                    </span>
                    <span class="sr-only">Corner Marks</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-center" value={$center} bind:group={$userToolState} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-center">
                    <span aria-hidden="true" style="font-size: 50%;">123</span>
                    <span class="sr-only">Center Marks</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-colors" value={$colors} bind:group={$userToolState} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-colors">
                    <span class="icon icon-inline icon-c-textinv icon-colors" />
                    <span class="sr-only">Colors</span>
                </label>
            </div>
        </div>
    </div>
    <div class="right-container">
        <div class="right">
            <div class="num-pad">
                <button class="mdc-ripple-surface padbutton" style="grid-area: 1 / 1 / 2 / 2" value="1"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>1</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 1 / 2 / 2 / 3" value="2"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>2</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 1 / 3 / 2 / 4" value="3"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>3</button>

                <button class="mdc-ripple-surface padbutton" style="grid-area: 2 / 1 / 3 / 2" value="4"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>4</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 2 / 2 / 3 / 3" value="5"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>5</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 2 / 3 / 3 / 4" value="6"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>6</button>

                <button class="mdc-ripple-surface padbutton" style="grid-area: 3 / 1 / 4 / 2" value="7"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>7</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 3 / 2 / 4 / 3" value="8"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>8</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 3 / 3 / 4 / 4" value="9"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>9</button>

                <button class="mdc-ripple-surface padbutton" style="grid-area: 4 / 1 / 5 / 2" value="0"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}>0</button>
                <button class="mdc-ripple-surface padbutton" style="grid-area: 4 / 2 / 5 / 4" value="Delete"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined} title="Delete" aria-label="Delete">
                    <span class="icon icon-inline icon-c-textinv icon-delete" />
                </button>
            </div>
            <div class="ctrl-pad">
                <button class="mdc-ripple-surface padbutton" title="Undo" aria-label="Undo">
                    <span class="icon icon-inline icon-c-textinv icon-undo" />
                </button>
                <button class="mdc-ripple-surface padbutton" title="Redo" aria-label="Redo">
                    <span class="icon icon-inline icon-c-textinv icon-undo redo" />
                </button>
                <button class="mdc-ripple-surface padbutton" title="Take Screenshot" aria-label="Take Screenshot">
                    <span class="icon icon-inline icon-c-textinv icon-screenshot" />
                </button>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    @use "sass:math";
    @use "@material/ripple";
    @use '../../css/vars' as vars;

    @mixin aspect-ratio-container($aspect-ratio-inv, $width) {
        width: $width;
        height: 0;
        padding-bottom: $width * $aspect-ratio-inv;
        position: relative;
    }
    @mixin aspect-ratio-child {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    $padbutton-border-radius: 0.2em;

    .padbutton {
        @include ripple.states-base-color(#fff);

        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        display: block;
        box-sizing: border-box;

        display: block;
        font-family: inherit;
        margin: 0;
        padding: 0;
        border: 0;
        text-align: center;
        background: none;
        cursor: pointer;

        font-size: 1em;
        font-weight: vars.$font-weight-heavy;
        color: #fff;

        border-radius: $padbutton-border-radius;
        border: 0.06em solid vars.$color-clickable;
        background-color: vars.$color-clickable;

        @include vars.breakpoint-mobile {
            font-size: 5vw;
        }
    }

    .mode-pad > * {
        position: relative;
        height: 0;
        padding-bottom: 100%;

        .radio-mode-button {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;

            border-radius: $padbutton-border-radius;
        }
        .radio-mode-button, .padbutton.padbutton-mode {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .padbutton-mode:not(.radio-mode-button:checked ~ *) {
        @include ripple.states-base-color(#000);

        color: vars.$color-clickable;
        background-color: #fff;
        .icon {
            background-color: vars.$color-clickable;
        }
    }

    .container {
        display: flex;
        justify-content: space-between;
        .mode-pad-container {
            @include aspect-ratio-container(math.div(42, 9), math.div(2 * 100%, 9));

            .mode-pad {
                @include aspect-ratio-child();

                font-size: 108%;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
        }

        .right-container {
            @include aspect-ratio-container(1.6, math.div(6 * 100%, 9));

            .right {
                @include aspect-ratio-child();

                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .num-pad {
                    width: 100%;
                    height: 82%;

                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    column-gap: 5%;
                    grid-template-rows: 1fr 1fr 1fr 1fr;
                    row-gap: 3.703703703%;

                    > * {
                        line-height: 100%;
                    }
                }

                .ctrl-pad {
                    height: 15.2%;

                    font-size: 80%;

                    display: flex;
                    @include vars.gap(3.5%);

                    > * {
                        width: 24.444%;
                    }
                }
            }
        }
    }
</style>
