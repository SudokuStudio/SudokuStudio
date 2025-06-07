<script lang="ts">
    import { boardState } from '$lib/js/board';

    // Hide spellcheck squiggles when the user is not editing the rules.
    function setSpellcheck(event: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement }): void {
        event.currentTarget.setAttribute('spellcheck', `${document.activeElement === event.currentTarget}`);
    }

    const title = boardState.ref<string>('meta', 'title');
    const author = boardState.ref<string>('meta', 'author');
    const description = boardState.ref<string>('meta', 'description');

    function updateWindowTitle() {
        const puzzleTitle = title.get();
        const puzzleAuthor = author.get();
        let windowTitle: string;

        if (puzzleTitle && puzzleAuthor) {
            windowTitle = `${puzzleTitle} by ${puzzleAuthor}`;
        } else if (puzzleTitle) {
            windowTitle = puzzleTitle;
        } else {
            windowTitle = 'Sudoku Studio';
        }

        document.title = windowTitle;
    }

    updateWindowTitle();
</script>

<div class="entry-info">
    <input
        class="info-input title"
        type="text"
        placeholder="Classic Sudoku"
        bind:value={$title}
        on:change={updateWindowTitle}
    />
    <input
        class="info-input setter"
        type="text"
        placeholder="Anonymous"
        bind:value={$author}
        on:change={updateWindowTitle}
    />
    <textarea
        class="rules-text"
        placeholder="Normal sudoku rules apply."
        spellcheck="false"
        bind:value={$description}
        on:focus={setSpellcheck}
        on:blur={setSpellcheck}
    ></textarea>
</div>

<style lang="scss">
    @use 'sass:math';
    @use '$lib/css/vars' as vars;

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
        &:hover,
        &:focus {
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
            &:hover,
            &:focus {
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
</style>
