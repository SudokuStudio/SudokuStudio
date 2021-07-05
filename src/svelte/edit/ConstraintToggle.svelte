<script lang="ts" context="module">
    let counter = 0;
</script>
<script lang="ts">
    import Icon from '../Icon.svelte';

    export let name: string;
    export let icon: string;
    export let checked: boolean;
</script>

<div class="constraint-toggle">
    <label for="toggle-{++counter}" title={name}>
        <Icon {icon} />
        <span class="sr-only">{name}</span>
    </label>
    <input id="toggle-{counter}" type="checkbox" checked={checked} on:input />
</div>

<style lang="scss">
    .constraint-toggle {
        margin-left: 0.5em;
        display: inline-block;
    }
</style>