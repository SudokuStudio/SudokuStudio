<script lang="ts">
    import { TOOL_INPUT_NAME, userToolState, userState, userPrevToolState, userSelectState, userCursorIsShownState } from "../../js/user";
    import { currentInputHandler } from "../../js/elementStores";
    import DigitButton from "./DigitButton.svelte";

    // Button ripples.
    import { MDCRipple } from "@material/ripple";
    import { onMount } from "svelte";
    import { changeHistory } from "../../js/history";
    import { saveSvgAsPng } from "save-svg-as-png";
    import { boardState, boardDiv, boardSvg } from "../../js/board";

    onMount(() => Array.prototype.forEach.call(document.getElementsByClassName('mdc-ripple-surface'), el => MDCRipple.attachTo(el)));

    function setPreviousMode() {
        userPrevToolState.set(userToolState.get());
    }

    const filled = userState.ref('marks', 'filled');
    const corner = userState.ref('marks', 'corner');
    const center = userState.ref('marks', 'center');
    const colors = userState.ref('marks', 'colors');

    function getToolName(userToolState: string): string {
        switch (userToolState) {
            case filled.get():
                return 'filled';
            case corner.get():
                return 'corner';
            case center.get():
                return 'center';
            case colors.get():
                return 'colors';
            default:
                return '';
        }
    }

    // Keep focus on board if user *clicks* on button pad.
    function onBubblingClick(event: MouseEvent): void {
        const isKeyboardClick = 0 === event.screenX && 0 === event.screenY;
        if (!isKeyboardClick) {
            $boardDiv.focus();
        }
    }

    function saveImage(): void {
        // Clear selection.
        userSelectState.replace(null);
        userCursorIsShownState.replace(false);

        const title  = boardState.get<string>('meta', 'title')  || 'Untitled';
        const author = boardState.get<string>('meta', 'author') || 'Anonymous';
        const filename = `Sudoku Studio - ${title} by ${author}.png`;
        const unsubscribe = boardSvg.subscribe(svg => saveSvgAsPng(svg, filename, {
            scale: 100,
            backgroundColor: '#fff',
            top: svg.viewBox.baseVal.x,
            left: svg.viewBox.baseVal.y,
        }));
        unsubscribe();
    }
</script>

<div class="container" on:click={onBubblingClick}>
    <div class="mode-pad-container">
        <div class="mode-pad">
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-digits"
                    value={$filled} bind:group={$userToolState} on:change={setPreviousMode} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-digits" title="Fill digits">
                    <span aria-hidden="true">1</span>
                    <span class="sr-only">Fill Digits tool</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-corner"
                    value={$corner} bind:group={$userToolState} on:change={setPreviousMode} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-corner" title="Corner marks [shift]">
                    <span aria-hidden="true" style="font-size: 50%;">
                        <span style="position: absolute; top:    12%; left:  20%;">1</span>
                        <span style="position: absolute; top:    12%; right: 20%;">2</span>
                        <span style="position: absolute; bottom: 12%; left:  20%;">3</span>
                    </span>
                    <span class="sr-only">Corner Marks tool [shift]</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-center"
                    value={$center} bind:group={$userToolState} on:change={setPreviousMode} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-center" title="Center marks [cmd or ctrl]">
                    <span aria-hidden="true" style="font-size: 50%;">123</span>
                    <span class="sr-only">Center Marks tool [cmd or ctrl]</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name={TOOL_INPUT_NAME} id="mode-radio-colors"
                    value={$colors} bind:group={$userToolState} on:change={setPreviousMode} />
                <label class="mdc-ripple-surface padbutton padbutton-mode" role="button" for="mode-radio-colors" title="Color highlights [alt]">
                    <span class="icon icon-inline icon-c-textinv icon-colors" />
                    <span class="sr-only">Colors tool [alt]</span>
                </label>
            </div>
        </div>
    </div>
    <div class="right-container">
        <div class="right">
            <div class="num-pad">
                <DigitButton digit={1} gridArea="1 / 1 / 2 / 2" toolName={getToolName($userToolState)} />
                <DigitButton digit={2} gridArea="1 / 2 / 2 / 3" toolName={getToolName($userToolState)} />
                <DigitButton digit={3} gridArea="1 / 3 / 2 / 4" toolName={getToolName($userToolState)} />

                <DigitButton digit={4} gridArea="2 / 1 / 3 / 2" toolName={getToolName($userToolState)} />
                <DigitButton digit={5} gridArea="2 / 2 / 3 / 3" toolName={getToolName($userToolState)} />
                <DigitButton digit={6} gridArea="2 / 3 / 3 / 4" toolName={getToolName($userToolState)} />

                <DigitButton digit={7} gridArea="3 / 1 / 4 / 2" toolName={getToolName($userToolState)} />
                <DigitButton digit={8} gridArea="3 / 2 / 4 / 3" toolName={getToolName($userToolState)} />
                <DigitButton digit={9} gridArea="3 / 3 / 4 / 4" toolName={getToolName($userToolState)} />

                <DigitButton digit={0} gridArea="4 / 1 / 5 / 2" toolName={getToolName($userToolState)} />
                <button class="mdc-ripple-surface padbutton" style="grid-area: 4 / 2 / 5 / 4" value="Delete" title="Delete [del or backspace]"
                    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined} aria-label="Delete">
                    <span class="icon icon-inline icon-c-textinv icon-delete" />
                </button>
            </div>
            <div class="ctrl-pad">
                <button class="mdc-ripple-surface padbutton" title="Undo [ctrl+z]" aria-label="Undo [ctrl+z]" on:click={() => changeHistory(false)}>
                    <span class="icon icon-inline icon-c-textinv icon-undo" />
                </button>
                <button class="mdc-ripple-surface padbutton" title="Redo [ctrl+y]" aria-label="Redo [ctrl+y]" on:click={() => changeHistory(true)}>
                    <span class="icon icon-inline icon-c-textinv icon-undo redo" />
                </button>
                <button class="mdc-ripple-surface padbutton" title="Save Image" aria-label="Save Image" on:click={saveImage}>
                    <span class="icon icon-inline icon-c-textinv icon-screenshot" />
                </button>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    @use "sass:math";
    @use "@material/ripple";
    @use '../../css/padbutton';
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

    .mode-pad > * {
        position: relative;
        height: 0;
        padding-bottom: 100%;

        .radio-mode-button {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;

            border-radius: vars.$padbutton-border-radius;
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
