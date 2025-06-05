<script context="module" lang="ts">
    import { initUserAndBoard } from '$lib/js/init';
    initUserAndBoard();
</script>

<script lang="ts">
    import { boardDiv, boardState } from '$lib/js/board';
    import BoardContainer from '$lib/svelte/board/BoardContainer.svelte';
    import Header from '$lib/svelte/header/Header.svelte';
    import Footer from '$lib/svelte/Footer.svelte';
    import EntryInfo from '$lib/svelte/entry/EntryInfo.svelte';
    import ButtonPad from '$lib/svelte/entry/ButtonPad.svelte';
</script>

<header>
    <button class="nobutton focus-skip" on:click={() => $boardDiv && $boardDiv.focus()}>Jump To Board</button>
    <div class="content">
        <div class="content-row">
            <Header />
        </div>
    </div>
</header>
<main>
    <div class="content">
        <div class="content-row">
            <div class="left-panel">
                <EntryInfo />
            </div>
            <div class="center-panel">
                <BoardContainer {boardState} />
            </div>
            <div class="right-panel">
                <ButtonPad />
            </div>
        </div>
    </div>
</main>
<Footer />

<style lang="scss">
    @use '$lib/css/vars.scss' as vars;

    header {
        font-size: 0.8rem;
        flex: 0 0 auto;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: vars.$header-height;
    }

    main {
        flex: 1 1 auto;

        display: flex;
        > .content {
            flex: 1;
        }

        .left-panel,
        .right-panel {
            flex: 1 1 100%;
            overflow: visible auto;
            height: calc(100vh - #{vars.$header-height + vars.$footer-height});
        }

        .center-panel {
            flex: 0 0 auto;

            /* maintain square aspect ratio */
            width: vars.$sudoku-size-big;
            height: vars.$sudoku-size-big;

            position: relative;
        }
    }

    @include vars.breakpoint-mobile {
        main {
            .content-row {
                flex-direction: column;
            }
            .center-panel {
                width: vars.$sudoku-size-small;
                height: vars.$sudoku-size-small;

                align-self: center;

                -webkit-tap-highlight-color: transparent;
                touch-action: none;
            }
            .left-panel {
                display: none;
            }
        }
    }
</style>
