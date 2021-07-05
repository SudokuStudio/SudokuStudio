<div class="header-left">
    <ul class="header-buttons left">
        <li>Solving/Setting</li>
        <li>New Grid</li>
        <li>Export</li>
    </ul>
</div>
<div class="header-center">
    <h1>Double Agent</h1>
    <div class="setter">by echoes and TauCeti Deichmann</div>
</div>
<div class="header-right">
    <ul class="header-buttons right">
        <li>Light/dark</li>
        <li>Help</li>
        <li>Settings</li>
    </ul>
</div>

<style lang="scss">
    @use '../styles/vars';

    .header-left {
        flex: 1 1 100%;
        align-self: baseline;
    }
    .header-center {
        flex: 0 1 auto;
        align-self: baseline;
        text-align: center;

        max-width: vars.$sudoku-size-big;

        h1 {
            font-size: 2rem;
            font-weight: vars.$font-weight-heavy;
            white-space: nowrap;
            margin-bottom: 0.5rem;
        }

        .setter {
            white-space: nowrap;
            /* Maybe this needs a different font size. Not sure. */
        }
    }
    .header-right {
        flex: 1 1 100%;
        align-self: baseline;

        text-align: right;
    }

    @media (max-width: 800px) and (max-aspect-ratio: 5/4),
            (max-width: 600px)
    {
        .header-center {
            flex: 1 1 auto;

            max-width: none;
        }
        .header-left, .header-right {
            display: none;
        }
    }

    ul.header-buttons {
        display: flex;
        gap: 1rem;

        padding: 0;
        list-style-type: none;

        &.left {
            justify-content: flex-start;
        }
        &.right {
            justify-content: flex-end;
        }

        li {

        }

    }
</style>