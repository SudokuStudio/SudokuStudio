<script lang="ts" context="module">
    let counter = 0;
</script>
<script lang="ts">
    import { onDestroy } from 'svelte';
    import type { StateRef } from '../../js/state_manager';
    import Icon from '../Icon.svelte';

    export let name: string;
    export let icon: string;
    export let ref: StateRef;

    let checked: boolean;
    // State updates change UI.
    const watcher = ref.watch<boolean>((_path, _oldData, newData) => {
        checked = newData || false;
    }, true);
    // UI changes sent to state.
    const onInput: (event: Event & { currentTarget: HTMLInputElement}) => void = (event) => {
        ref.replace(event.currentTarget.checked);
    };
    onDestroy(() => ref.unwatch(watcher));
</script>

<div class="constraint-toggle">
    <label for="toggle-{++counter}" title={name} class='clickable'>
        <Icon {icon} color="text" />
        <span class="sr-only">{name}</span>
    </label>
    <input id="toggle-{counter}" type="checkbox" checked={checked} on:input={onInput} />
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