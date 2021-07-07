<script lang="ts" context="module">
    let counter = 0;
</script>
<script type="ts">
    import { selectedTool, selectedToolName } from "../../../js/input";
    import Icon from "../../Icon.svelte";

    export let id: string;
    export let name: string;
    export let unused: boolean;

    export let isLocal: boolean = false;
    export let onClick: svelte.JSX.MouseEventHandler<HTMLDivElement> | undefined =
        isLocal ? (() => $selectedTool = id) : undefined;

    export let onTrash: svelte.JSX.MouseEventHandler<HTMLButtonElement> | undefined = undefined;
</script>

<div class="constraint-row" role="button" on:click|stopPropagation={onClick}>
    {#if isLocal}
        <input class="radio-select-button" type="radio" id="local-radio-{++counter}" value={id} name={selectedToolName} bind:group={$selectedTool} />
    {/if}
    <div class="constraint-row-left">
        <button class="nobutton" on:click|stopPropagation={onTrash}>
            <Icon icon="trash" color="clickable" />
        </button>
        {#if isLocal}
            <label class:unused={unused} class="name clickable" for="local-radio-{counter}">{name}</label>
        {:else}
            <span class:unused={unused} class="name">{name}</span>
        {/if}
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

        margin: 0 0 0.5em 0;
        padding: 0.25em 0.5em;
        position: relative;
        white-space: nowrap;

        cursor: pointer;

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;
        }
    }

    .radio-select-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        pointer-events: none;
    }
    .radio-select-button:checked {
        border: 0.1em solid vars.$color-clickable;
        border-radius: 0.3em;
    }
</style>