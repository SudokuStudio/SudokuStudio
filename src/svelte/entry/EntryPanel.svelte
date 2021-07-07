<script lang="ts">

    function setSpellcheck(event: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement}): void {
        event.currentTarget.setAttribute('spellcheck', `${document.activeElement === event.currentTarget}`);
    }
</script>

<div class="entry-column">
    <div class="input-pad">
        <div class="mode-pad">
            <button>d</button>
            <button>s</button>
            <button>m</button>
            <button>c</button>
        </div>
        <div class="right">
            <div class="num-pad">
                <button style="grid-area: 1 / 1 / 2 / 2">1</button>
                <button style="grid-area: 1 / 2 / 2 / 3">2</button>
                <button style="grid-area: 1 / 3 / 2 / 4">3</button>

                <button style="grid-area: 2 / 1 / 3 / 2">4</button>
                <button style="grid-area: 2 / 2 / 3 / 3">5</button>
                <button style="grid-area: 2 / 3 / 3 / 4">6</button>

                <button style="grid-area: 3 / 1 / 4 / 2">7</button>
                <button style="grid-area: 3 / 2 / 4 / 3">8</button>
                <button style="grid-area: 3 / 3 / 4 / 4">9</button>

                <button style="grid-area: 4 / 1 / 5 / 2">0</button>
                <button style="grid-area: 4 / 2 / 5 / 4">x</button>
            </div>
            <div class="ctrl-pad">
                <button>u</button>
                <button>r</button>
                <button>s</button>
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

    .entry-column {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .input-pad {
            $button-size-med: 2.5rem;
            $button-size-large: 1.08 * $button-size-med;
            $button-size-small: 0.80 * $button-size-med;

            display: flex;
            gap: 0.56 * $button-size-med;

            width: 100%;


            .mode-pad {
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                width: $button-size-large;
                height: math.div(42 * $button-size-large, 9);

                button {
                    height: $button-size-large;
                }
            }

            .right {
                $gap: math.div(5 * $button-size-med, 30);

                .num-pad {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    column-gap: 5%;
                    grid-template-rows: 1fr 1fr 1fr 1fr;
                    row-gap: 3.703703703%;

                    $width: math.div(10 * 3 * $button-size-med, 9);
                    width: $width;
                    height: 1.35 * $width;

                    margin-bottom: $gap;
                }
                .ctrl-pad {
                    display: flex;
                    height: $button-size-small;
                    gap: $gap;

                    button {
                        width: $button-size-small;
                    }
                }
            }

            button {
                display: block;
                box-sizing: border-box;
            }
        }

        .rules {
            text-align: center;
            margin: 0.8em 0;
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