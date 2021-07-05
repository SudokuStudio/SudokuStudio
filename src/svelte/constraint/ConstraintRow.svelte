<script type="ts" context="module">
    export type Args = {
        name: string,
        toggles: Toggle[],
    }
    export type Toggle = {
        id: string,
        name: string,
        icon: string,
        value: boolean,
    };
    let counter = 0;
</script>
<script type="ts">
	import { createEventDispatcher } from 'svelte';

    import Icon from "../Icon.svelte";

    export let name: Args['name'];
    export let toggles: Args['toggles'];

	const dispatch = createEventDispatcher();
    function onToggle(id: string, event: Event) {
        dispatch('toggle', { id, event });
    }
</script>

<div class="constraint-row">
    <div class="constraint-row-left">
        <Icon icon="trash" />
        {name}
    </div>
    <div class="constraint-row-right">
        {#each toggles as { id, name, icon, value } (id)}
            <div class="constraint-iconbutton">
                <label for="checkbox-{id}-{++counter}">
                    <Icon {icon} />
                    <span class="sr-only">{name}</span>
                </label>
                <input id="checkbox-{id}-{counter}" type="checkbox" checked={value} on:input={event => onToggle(id, event)} />
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    @use '../../css/vars';
    @use '../../css/clearfix';

    .constraint-row {
        @include clearfix.clearfix;

        white-space: nowrap;

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;

            .constraint-iconbutton {
                margin-left: 0.5em;
                display: inline-block;
            }
        }
    }
</style>