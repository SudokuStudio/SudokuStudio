<div class="header-left">
    <ul class="header-buttons left">
        <li>Solving/Setting</li>
        <li>New Grid</li>
        <li>Export</li>
    </ul>
</div>
<div class="header-right">
    <ul class="header-buttons right">
        <li>Light/dark</li>
        <li>Help</li>
        <li>Settings</li>
    </ul>
</div>

<style lang="scss">
    @use 'src/css/vars';

    .header-left {
        flex: 1 1 100%;
        align-self: baseline;
    }
    .header-center {
        flex: 0 1 auto;
        align-self: baseline;
        text-align: center;

        max-width: vars.$sudoku-size-big;
    }
    .header-right {
        flex: 1 1 100%;
        align-self: baseline;

        text-align: right;
    }

    @include vars.breakpoint-mobile {
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
    }
</style>
