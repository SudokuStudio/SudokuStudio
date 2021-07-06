<script lang="ts" context="module">
    let counter = 0;
</script>
<script lang="ts">
    import type { StateRef } from '../../../js/state_manager';
    import Icon from '../../Icon.svelte';

    export let name: string;
    export let icon: string;
    export let checked: StateRef;
</script>

<div class="constraint-toggle">
    <label for="toggle-{++counter}" title={name} class='clickable'>
        <Icon {icon} color="text" />
        <span class="sr-only">{name}</span>
    </label>
    <input id="toggle-{counter}" type="checkbox" bind:checked={$checked} />
</div>

<style lang="scss">
    .clickable {
        cursor: pointer;
    }
    .constraint-toggle {
        margin-left: 0.5em;
        display: inline-block;
    }
</style>