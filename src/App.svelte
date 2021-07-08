<script lang="ts">
    import EditPanel from "./svelte/edit/EditPanel.svelte";
    import EntryPanel from "./svelte/entry/EntryPanel.svelte";
    import Header from "./svelte/Header.svelte";
</script>

<header>
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
                <EditPanel />
            </div>
            <div class="center-panel">
                <img src="svg/example-grid.svg" alt="Sudoku Grid" />
            </div>
            <div class="right-panel">
                <EntryPanel />
            </div>
        </div>
    </div>
</main>
<footer>SudokuStudio</footer>

<style lang="scss">
    @use './css/vars' as vars;

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

        .left-panel, .right-panel {
            flex: 1 1 100%;
            overflow: visible auto;
            height: calc(100vh - #{vars.$header-height + vars.$footer-height});
        }

        .center-panel {
            flex: 0 0 auto;

            /* maintain square aspect ratio */
            width: vars.$sudoku-size-big;
            height: vars.$sudoku-size-big;
        }
    }

    @include vars.breakpoint-mobile {
        main {
            .content-row {
                flex-direction: column;
            }
            .center-panel {
                width: vars.$sudoku-size-small; height: vars.$sudoku-size-small;

                align-self: center;
            }
            .left-panel {
                display: none;
            }
        }
    }

    footer {
        flex: 0 0 auto;
        height: vars.$footer-height;
        line-height: vars.$footer-height;

        font-size: 0.8rem;
        text-align: center;
    }
</style>
