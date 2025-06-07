<script lang="ts">
    import { onDestroy } from 'svelte';
    import ButtonPad from './ButtonPad.svelte';
    import EntryInfo from './EntryInfo.svelte';
</script>

<div class="entry-column">
    <div class="entry-pad">
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
