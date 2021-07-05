<script type="ts">
    import Icon from "../Icon.svelte";

    export let name: string;
</script>

<div class="constraint-row">
    <div class="constraint-row-left">
        <Icon icon="trash" />
        {name}
    </div>
    <div class="constraint-row-right">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    @use 'src/css/vars';
    @use 'src/css/clearfix';

    .constraint-row {
        @include clearfix.clearfix;

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