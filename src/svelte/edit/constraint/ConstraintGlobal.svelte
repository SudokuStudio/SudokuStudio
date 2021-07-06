<script type="ts">
    import Icon from "../../Icon.svelte";

    export let name: string;
    export let unused: boolean;
</script>

<div class="constraint-row">
    <div class="constraint-row-left">
        <Icon icon="trash" color="clickable" />
        <span class:unused={unused}>{name}</span>
    </div>
    <div class="constraint-row-right">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    @use 'src/css/vars';
    @use 'src/css/clearfix';

    .unused {
        opacity: 0.5;
    }

    .constraint-row {
        @include clearfix.clearfix;

        margin: 0 0 0.8em 0;
        white-space: nowrap;

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;
        }
    }
</style>