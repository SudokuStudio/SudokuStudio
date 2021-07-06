<script lang="ts">
    export let title: string;

    export let closed: boolean = false;

    function onClick() {
        closed = !closed;
    }
</script>

<div class:closed={closed}>
    <button class="section-title" on:click={onClick}>
        <span class="tree-menu icon icon-inline icon-c-clickable icon-tree-menu" />
        {title}
    </button>
    <div class="panel">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    @use 'src/css/vars';

    .section-title {
        margin: 0.5em 0;
        font-weight: vars.$font-weight-heavy;

        font-size: 1em;
        font-family: inherit;
        border: 0;
        padding: 0;
        background: none;
        cursor: pointer;

        white-space: nowrap;
    }

    .tree-menu {
        transition: transform 0.1s ease-in-out;
    }
    .closed .tree-menu {
        transform: rotate(-90deg);
    }

    // .panel {
    // }
    .closed .panel {
        overflow: hidden;
        height: 0;
    }
</style>
