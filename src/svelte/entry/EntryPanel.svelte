<script lang="ts">
import { onDestroy } from "svelte";
import ButtonPad from "./ButtonPad.svelte";
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
        <ButtonPad />
    </div>
    <div class="entry-info">
        <h1 class="title">Killer</h1>
        <div class="setter">Setter unknown</div>
        <textarea class="rules-text" spellcheck="false" on:focus={setSpellcheck} on:blur={setSpellcheck}>Normal killer sudoku rules apply: digits in cages sum to the number in the cage's top left, and do not repeat.</textarea>
    </div>
</div>

<style lang="scss">
    @use "sass:math";
    @use '../../css/vars' as vars;

    h1 {
        font-size: 1.4rem;
        font-weight: vars.$font-weight-heavy;
        white-space: nowrap;
        margin-top: 0;
        margin-bottom: 0.25rem;
        text-align: center;
    }

    .setter {
        white-space: nowrap;
        font-size: 0.7rem;
        color: gray;
        text-align: center;
    }

    .entry-column {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: vars.$sudoku-size-big; // To stick numpad to bottom of sudoku grid.

        .entry-pad {
            width: 100%;

            @include vars.breakpoint-mobile {
                width: 50%;
                margin: 0 auto;
            }
        }

        .entry-info {
            flex: 1 1 20vh;
            min-height: 8em;
            margin: 0 0 1em 0;

            display: flex;
            flex-direction: column;

            textarea.rules-text {
                flex: 1 1 20vh;
                font-size: 0.7rem;

                resize: none;
                margin-top: 1em;
                padding: 0.5em;
                min-height: 5em;

                outline: none;
                @include vars.hoverborder();
                &:hover, &:focus {
                    outline: none;
                    @include vars.hoverborder-hover();
                }

            }

            // Reorder so entry-pad is before rules.
            order: -1;
            @include vars.breakpoint-mobile {
                // Except when collapsing breakpoint is hit.
                order: 0;
                margin: 1em 0 0 0;
            }
        }
    }
</style>
