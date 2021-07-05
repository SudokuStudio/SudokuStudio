<script lang="ts">
    export let title: string;

    import Icon from "./Icon.svelte";
</script>

<div>
    <h4 class="section-title">
        <Icon icon="tree-menu-shown" />
        {title}
    </h4>
    <slot></slot>
</div>

<style lang="scss">
    @use '../css/vars';
    .section-title {
        margin: 0.5em 0;
        font-weight: vars.$font-weight-heavy;

        white-space: nowrap;
    }
</style>
