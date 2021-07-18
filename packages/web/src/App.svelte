<script lang="ts">
    import { boardDiv } from "./js/board";
    import { SUDOKU_STUDIO_VERSION, URL_NEW_FEATURE_REQUEST, URL_NEW_ISSUE } from "./js/github";
    import BoardContainer from "./svelte/board/BoardContainer.svelte";
    import EditPanel from "./svelte/edit/EditPanel.svelte";
    import EntryPanel from "./svelte/entry/EntryPanel.svelte";
    import Header from "./svelte/Header.svelte";

    let bugReportBoardUrl: string = '';
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
                <EditPanel />
            </div>
            <div class="center-panel">
                <BoardContainer />
            </div>
            <div class="right-panel">
                <EntryPanel />
            </div>
        </div>
    </div>
</main>
<footer>
    <a href="https://github.com/SudokuStudio/SudokuStudio">
        Sudoku Studio v.{SUDOKU_STUDIO_VERSION}
    </a>
    <form target="_blank" action={URL_NEW_ISSUE} method="get">
        <input type="hidden" name="labels" value="bug" />
        <input type="hidden" name="template" value="bug_report.yml" />
        <input type="hidden" name="title" value="🐞 Bug: " />
        <input type="hidden" name="version" value={SUDOKU_STUDIO_VERSION} />
        <input type="hidden" name="browser" value={navigator.userAgent} />
        <input type="hidden" name="os" value={navigator.platform} />
        <input type="hidden" name="url" value={bugReportBoardUrl} />
        <input class="anchor nobutton" type="submit" value="Report Bug" on:click={() => bugReportBoardUrl = window.location.href} />
    </form>
    <a href={URL_NEW_FEATURE_REQUEST}>
        Request Feature
    </a>
</footer>

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

            position: relative;
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

        display: flex;
        justify-content: center;
        @include vars.gap(5em);
    }
</style>
