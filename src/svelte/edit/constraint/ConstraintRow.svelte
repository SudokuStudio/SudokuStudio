<script lang="ts" context="module">
    let counter = 0;
</script>
<script type="ts">
    import { selectedTool, selectedToolName } from "../../../js/input";

    export let id: string;
    export let name: string;
    export let unused: boolean;

    export let isLocal: boolean = false;
    export let onClick: svelte.JSX.MouseEventHandler<HTMLDivElement> | undefined =
        isLocal ? (() => $selectedTool = id) : undefined;

    export let onTrash: svelte.JSX.MouseEventHandler<HTMLButtonElement> | undefined = undefined;
</script>

<div class="constraint-row-container">
    {#if isLocal}
        <input class="radio-select-button" type="radio" id="local-radio-{++counter}" value={id} name={selectedToolName} bind:group={$selectedTool} />
    {/if}
    <div class="constraint-row" class:global={!isLocal} role="button" on:click|stopPropagation={onClick}>
        <div class="constraint-row-left">
            <button class="nobutton" on:click|stopPropagation={onTrash}>
                <span class="icon icon-inline icon-c-clickable icon-trash" />
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
</div>

<style lang="scss">
    @use 'src/css/vars';
    @use 'src/css/clearfix';

    .unused {
        opacity: 0.5;
    }

    .constraint-row-container {
        margin: 0.25em 0 0.5em .75em;
        position: relative;
    }

    .constraint-row {
        @include clearfix.clearfix;

        padding: 0.25em 0.25em;

        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        @include vars.hoverborder();

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;
        }

        z-index: 0;
    }
    .constraint-row:hover, .radio-select-button:checked ~ .constraint-row {
        @include vars.hoverborder-hover();
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
        border-radius: vars.$hoverborder-radius;
    }
</style>