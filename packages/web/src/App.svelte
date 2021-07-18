<script lang="ts">
import { debounce } from "debounce";

    import { boardDiv } from "./js/board";
    import { SUDOKU_STUDIO_VERSION, URL_REQUEST_FEATURE, URL_REPORT_BUG } from "./js/github";
    import BoardContainer from "./svelte/board/BoardContainer.svelte";
    import EditPanel from "./svelte/edit/EditPanel.svelte";
    import EntryPanel from "./svelte/entry/EntryPanel.svelte";
    import Header from "./svelte/Header.svelte";

    function updateBugReportUrl(event: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement}): void {
        const url = new URL(URL_REPORT_BUG);
        url.searchParams.append('version', SUDOKU_STUDIO_VERSION);
        url.searchParams.append('browser', window.navigator.userAgent);
        url.searchParams.append('os', window.navigator.platform);
        url.searchParams.append('url', window.location.href);
        event.currentTarget.href = url.href;
    }
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
    <div class="footer-text">
        <a target="_blank" href="https://github.com/SudokuStudio/SudokuStudio">
            Sudoku Studio v.{SUDOKU_STUDIO_VERSION}
        </a>
        <a target="_blank" href={URL_REPORT_BUG} on:mouseover={debounce(updateBugReportUrl, 500, true)}>
            Bug Report
        </a>
        <a target="_blank" href={URL_REQUEST_FEATURE}>
            Feature Request
        </a>
    </div>
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

        .footer-text {
            margin: 0 auto;
            width: 100%;
            max-width: 35em;

            display: flex;
            justify-content: space-evenly;
            @include vars.gap(2em);
        }
    }
</style>
