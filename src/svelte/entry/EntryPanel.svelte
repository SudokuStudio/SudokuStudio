<script lang="ts">
import { onDestroy } from "svelte";
    // Hide spellcheck squiggles when the user is not editing the rules.
    function setSpellcheck(event: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement}): void {
        event.currentTarget.setAttribute('spellcheck', `${document.activeElement === event.currentTarget}`);
    }

    // Unfortunately there is no way to size the text to based on the parent (in this case button) size in native CSS.
    // So we have to use a bit of javascript to set the font size when the page resizes.
    let entryPadEl: HTMLDivElement;
    function onResize() {
        entryPadEl.style.fontSize = `${0.12 * entryPadEl.clientWidth}px`;
    }
    window.addEventListener('resize', onResize);
    onDestroy(() => window.removeEventListener('resize', onResize));
    requestAnimationFrame(onResize); // Run on load.
</script>

<div class="entry-column">
    <div class="entry-pad" bind:this={entryPadEl}>
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
    <h4 class="rules">Rules</h4>
    <textarea class="rules-text" spellcheck="false" on:focus={setSpellcheck} on:blur={setSpellcheck}>Normal sudoku rules do not apply. In each row, column, and box, place eight of the nine digits from 1-9, and repeat one of them; one digit in each set must be missing.

No two rows, no two columns, and no two boxes may share the same repeated or missing digit.

The clues (sandwich sums) outside the grid indicate the sum of the digits between any 1 and any 9 in the appropriate row or column: at least one set must sum correctly. Such a row or column must have at least one 1 and at least one 9.

The sum of the cells on an arrow is the digit placed in its circle; digits may repeat along an arrow if allowed by the other rules.</textarea>
</div>

<style lang="scss">
    @use "sass:math";
    @use '../../css/vars' as vars;

    .icon-undo.redo {
        transform: scaleX(-1);
    }

    .padbutton {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        display: block;
        font-family: inherit;
        margin: 0;
        padding: 0;
        border: 0;
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

    .entry-column {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .entry-pad {
            display: flex;
            justify-content: space-between;

            width: 100%;

            .mode-pad-container {
                @include aspect-ratio-container(math.div(42, 9), math.div(2 * 100%, 9));

                .mode-pad {
                    @include aspect-ratio-child();

                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    button {
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

                        > button {
                            line-height: 100%;
                        }
                    }

                    .ctrl-pad {
                        height: 15.2%;

                        display: flex;
                        gap: 3.5%;

                        button {
                            width: 24.444%;
                        }
                    }
                }
            }

            button {
                display: block;
                box-sizing: border-box;
            }

            @include vars.breakpoint-mobile {
                width: 50%;
                margin: 0 auto;
            }
        }

        .rules {
            text-align: center;
            margin: 1em 0 0.5em 0;
        }
        .rules-text {
            flex: 1 1 20vh;
            width: 100%;
            font-size: 0.7rem;

        }
        textarea.rules-text {
            resize: none;
            border: none;
        }
    }
</style>