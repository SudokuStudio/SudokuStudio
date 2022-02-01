<script lang="ts" context="module">
    let counter = 0;
</script>
<script lang="ts">
    import { pushHistory } from "../../../js/history";
    import type { StateRef } from '@sudoku-studio/state-manager';

    export let name: string;
    export let icon: string;
    export let checked: StateRef;

    function onClick() {
        const diff = checked.replace(!checked.get<boolean>());
        pushHistory(diff);
    }
</script>

<div class="constraint-checkbox" on:click|stopPropagation>
    <label for="checkbox-{++counter}" title={name} class="clickable">
        <span class="icon icon-inline icon-c-text icon-{icon}" />
        <span class="sr-only">{name}</span>
    </label>
    <input id="checkbox-{counter}" type="checkbox" on:change={onClick} checked={$checked} />
</div>

<style lang="scss">
    .constraint-checkbox {
        margin-left: 0.5em;
        display: inline-block;
    }
</style>