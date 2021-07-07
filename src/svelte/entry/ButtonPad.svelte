<script lang="ts">
    let mode: string = 'digits';
</script>

<div class="container">
    <div class="mode-pad-container">
        <div class="mode-pad">
            <!-- TOOD switch to INPUT RADIOs. -->
            <div>
                <input class="radio-mode-button" type="radio" name="mode" id="mode-radio-digits" value="digits" bind:group={mode} />
                <label class="padbutton padbutton-mode" role="button" for="mode-radio-digits">
                    <span aria-hidden="true">1</span>
                    <span class="sr-only">Digits</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name="mode" id="mode-radio-corner" value="corner" bind:group={mode} />
                <label class="padbutton padbutton-mode" role="button" for="mode-radio-corner">
                    <span aria-hidden="true" style="font-size: 50%;">
                        <span style="position: absolute; top:    12%; left:  20%;">1</span>
                        <span style="position: absolute; top:    12%; right: 20%;">2</span>
                        <span style="position: absolute; bottom: 12%; left:  20%;">3</span>
                    </span>
                    <span class="sr-only">Corner Marks</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name="mode" id="mode-radio-center" value="center" bind:group={mode} />
                <label class="padbutton padbutton-mode" role="button" for="mode-radio-center">
                    <span aria-hidden="true" style="font-size: 50%;">123</span>
                    <span class="sr-only">Center Marks</span>
                </label>
            </div>
            <div>
                <input class="radio-mode-button" type="radio" name="mode" id="mode-radio-colors" value="colors" bind:group={mode} />
                <label class="padbutton padbutton-mode" role="button" for="mode-radio-colors">
                    <span class="icon icon-inline icon-c-textinv icon-colors" />
                    <span class="sr-only">Colors</span>
                </label>
            </div>
        </div>
    </div>
    <div class="right-container">
        <div class="right">
            <div class="num-pad">
                <button class="padbutton" style="grid-area: 1 / 1 / 2 / 2">1</button>
                <button class="padbutton" style="grid-area: 1 / 2 / 2 / 3">2</button>
                <button class="padbutton" style="grid-area: 1 / 3 / 2 / 4">3</button>

                <button class="padbutton" style="grid-area: 2 / 1 / 3 / 2">4</button>
                <button class="padbutton" style="grid-area: 2 / 2 / 3 / 3">5</button>
                <button class="padbutton" style="grid-area: 2 / 3 / 3 / 4">6</button>

                <button class="padbutton" style="grid-area: 3 / 1 / 4 / 2">7</button>
                <button class="padbutton" style="grid-area: 3 / 2 / 4 / 3">8</button>
                <button class="padbutton" style="grid-area: 3 / 3 / 4 / 4">9</button>

                <button class="padbutton" style="grid-area: 4 / 1 / 5 / 2">0</button>
                <button class="padbutton" style="grid-area: 4 / 2 / 5 / 4" title="Delete" aria-label="Delete">
                    <span class="icon icon-inline icon-c-textinv icon-delete" />
                </button>
            </div>
            <div class="ctrl-pad">
                <button class="padbutton" title="Undo" aria-label="Undo">
                    <span class="icon icon-inline icon-c-textinv icon-undo" />
                </button>
                <button class="padbutton" title="Redo" aria-label="Redo">
                    <span class="icon icon-inline icon-c-textinv icon-undo redo" />
                </button>
                <button class="padbutton" title="Take Screenshot" aria-label="Take Screenshot">
                    <span class="icon icon-inline icon-c-textinv icon-screenshot" />
                </button>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    @use "sass:math";
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
        display: block;
        box-sizing: border-box;

        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

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
    .radio-mode-button:checked ~ .padbutton-mode {
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
