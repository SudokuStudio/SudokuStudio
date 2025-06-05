<script lang="ts">
    import { onDestroy } from 'svelte';
    import ButtonPad from './ButtonPad.svelte';
    import EntryInfo from './EntryInfo.svelte';

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
    <EntryInfo />
</div>

<style lang="scss">
    @use 'sass:math';
    @use '$lib/css/vars' as vars;

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
    }
</style>
