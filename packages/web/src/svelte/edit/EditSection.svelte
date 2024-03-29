<script lang="ts">
    export let icon: string;
    export let title: string;
    export let closed: boolean = false;
    export let onAdd: undefined | svelte.JSX.MouseEventHandler<HTMLButtonElement> = undefined;

    function onClick() {
        closed = !closed;
    }
</script>

<div class="container" class:closed>
    <div role="button" tabindex="0" class="section-title" on:click={onClick}>
        <button class={`add-button nobutton hoverable ${onAdd ?? 'hide-button'}`} on:click|stopPropagation={onAdd}>
            <span class="icon hoverable-icon icon-inline icon-c-clickable icon-add" />
        </button>
        <span>
            <span class="icon hoverable-icon icon-inline icon-c-text icon-{icon}" />
            {title}
        </span>
        <span class="tree-menu-wrapper">
            <span class="tree-menu icon icon-inline icon-c-clickable icon-tree-menu" />
        </span>
    </div>
    <div class="panel-wrapper">
        <div class="panel">
            <slot />
        </div>
    </div>
</div>

<style lang="scss">
    @use '../../css/vars';

    .section-title {
        font-weight: vars.$font-weight-heavy;

        display: inline-block;
        font-size: 1em;
        font-family: inherit;
        margin: 0;
        background: none;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        text-align: left;

        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        white-space: nowrap;

        @include vars.hoverborder();
        &:hover, &:focus-visible {
            @include vars.hoverborder-hover();
        }

        .add-button {
            padding: 0.5em;

            &.hide-button {
                visibility: hidden;
            }
        }
    }

    .tree-menu-wrapper {
        display: flex;
        float: right;
        padding: 0.5em;

        .tree-menu {
            transition: transform vars.$transition-time ease-in-out;
            transform: rotate(180deg);
            transform-origin: 50% 66%;
        }
    }

    .closed .tree-menu {
        transform: rotate(0deg);
    }

    .panel-wrapper {
        display: flex;
        overflow: hidden;
    }
    .panel-wrapper:after {
        content: "";
        height: 10px;
        transition: height vars.$transition-time linear,
            max-height 0s vars.$transition-time linear;
        max-height: 0px;
    }
    .panel {
        width: 100%;
        transition: margin-bottom vars.$transition-time cubic-bezier(0, 0, 0, 1);
        margin-bottom: 0;
        max-height: 1000000px;
    }
    .closed .panel-wrapper > .panel {
        margin-bottom: -2000px;
        transition: margin-bottom vars.$transition-time cubic-bezier(1, 0, 1, 1),
            visibility 0s vars.$transition-time,
            max-height 0s vars.$transition-time;
        visibility: hidden;
        max-height: 0;
    }
    .closed .panel-wrapper:after {
        height: 0;
        transition: height vars.$transition-time linear;
        max-height: 10px;
    }

    .container {
        margin-bottom: 0.5em;
    }
</style>
