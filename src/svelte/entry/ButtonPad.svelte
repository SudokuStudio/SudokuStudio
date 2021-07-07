<div class="container">
    <div class="mode-pad-container">
        <div class="mode-pad">
            <!-- TOOD switch to INPUT RADIOs. -->
            <button class="padbutton">1</button>
            <button class="padbutton" style="font-size: 50%;">123</button>
            <button class="padbutton">m</button>
            <button class="padbutton">c</button>
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
                <button class="padbutton" style="grid-area: 4 / 2 / 5 / 4; border-radius: 7.5% / 15%" title="Delete" aria-label="Delete">
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

        font-weight: vars.$font-weight-heavy;
        background-color: vars.$color-clickable;
        color: #fff;

        border-radius: 15%;
        font-size: 1em;

        @include vars.breakpoint-mobile {
            font-size: 5vw;
        }
    }

    .container {
        display: flex;
        justify-content: space-between;
        .mode-pad-container {
            @include aspect-ratio-container(math.div(42, 9), math.div(2 * 100%, 9));

            .mode-pad {
                @include aspect-ratio-child();

                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .padbutton {
                    height: math.div(3 * 100%, 14);
                }
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

                    > .padbutton {
                        line-height: 100%;
                    }
                }

                .ctrl-pad {
                    height: 15.2%;

                    display: flex;
                    @include vars.gap(3.5%);

                    .padbutton {
                        width: 24.444%;
                    }
                }
            }
        }
    }
</style>
