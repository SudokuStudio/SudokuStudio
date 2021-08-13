<script lang="ts">
    import { onDestroy } from "svelte";
    import { boardState } from "../../js/board";
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

    const title = boardState.ref('meta', 'title');
    const author = boardState.ref('meta', 'author');
    const description = boardState.ref('meta', 'description');
</script>

<div class="entry-column">
	<div class="entry-pad" bind:this={entryPadEl}>
        <ButtonPad />
    </div>
    <div class="entry-info">
        <input class="info-input title"  type="text" placeholder="Classic Sudoku" bind:value={$title} />
        <input class="info-input setter" type="text" placeholder="Anonymous" bind:value={$author} />
        <textarea class="rules-text" placeholder="Normal sudoku rules apply." spellcheck="false" bind:value={$description} on:focus={setSpellcheck} on:blur={setSpellcheck}></textarea>
    </div>
</div>

<style lang="scss">
    @use "sass:math";
    @use '../../css/vars' as vars;

    .info-input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        margin: 0;
        padding: 0;
        border: 0;
        outline: none;

        display: block;
        box-sizing: border-box;
        width: 100%;

        text-align: center;

        @include vars.hoverborder();
        &:hover, &:focus {
            outline: none;
            @include vars.hoverborder-hover();
        }
    }

    .title {
        font-size: 1.4rem;
        font-weight: vars.$font-weight-heavy;
        margin-bottom: 0.25rem;
    }

    .setter {
        font-size: 0.7rem;
    }

    textarea.rules-text {
        resize: none;
        padding: 0.5em;
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

                margin-top: 1em;
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
