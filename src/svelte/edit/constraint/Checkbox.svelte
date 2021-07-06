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

<div class="constraint-checkbox" on:click|stopPropagation>
    <label for="checkbox-{++counter}" title={name} class="clickable">
        <Icon {icon} color="text" />
        <span class="sr-only">{name}</span>
    </label>
    <input id="checkbox-{counter}" type="checkbox" bind:checked={$checked} />
</div>

<style lang="scss">
    .constraint-checkbox {
        margin-left: 0.5em;
        display: inline-block;
    }
</style>