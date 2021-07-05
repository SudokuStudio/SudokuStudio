<script lang="ts">
import EditPanel from "./svelte/EditPanel.svelte";
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
            <div class="right-panel">RIGHT PANEL</div>
        </div>
    </div>
</main>
<footer>SudokuStudio</footer>

<style lang="scss">
    @use './css/vars' as vars;

    header {
        flex: 0 0 auto;
        height: vars.$header-height;
    }

    main {
        flex: 1 0 auto;

        display: flex;
        > .content {
            flex: 1;
        }

        .left-panel {
            flex: 1 1 100%;
        }

        .center-panel {
            flex: 0 0 auto;

            /* maintain square aspect ratio */
            width: vars.$sudoku-size-big; height: vars.$sudoku-size-big;
        }

        .right-panel {
            flex: 1 1 100%;
        }
    }

    @media (max-width: 800px) and (max-aspect-ratio: 5/4),
            (max-width: 600px)
    {
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
