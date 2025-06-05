<script lang="ts">
    import { SUDOKU_STUDIO_VERSION } from '$env/static/public';
    import debounce from 'debounce';
    import { URL_REQUEST_FEATURE, URL_REPORT_BUG } from '$lib/js/github';

    function updateBugReportUrl(event: UIEvent & { currentTarget: EventTarget & HTMLAnchorElement }): void {
        const url = new URL(URL_REPORT_BUG);
        url.searchParams.append('version', SUDOKU_STUDIO_VERSION);
        url.searchParams.append('browser', window.navigator.userAgent);
        url.searchParams.append('os', window.navigator.platform);
        url.searchParams.append('url', window.location.href);
        event.currentTarget.href = url.href;
    }
</script>

<footer>
    <div class="footer-text">
        <a target="_blank" href="https://github.com/SudokuStudio/SudokuStudio/commit/{SUDOKU_STUDIO_VERSION}">
            Sudoku Studio v.{SUDOKU_STUDIO_VERSION}
        </a>
        <a
            target="_blank"
            href={URL_REPORT_BUG}
            on:mouseover={debounce(updateBugReportUrl, 500, true)}
            on:focus={updateBugReportUrl}
        >
            Bug Report
        </a>
        <a target="_blank" href={URL_REQUEST_FEATURE}> Feature Request </a>
    </div>
</footer>

<style lang="scss">
    @use '$lib/css/vars.scss' as vars;

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
