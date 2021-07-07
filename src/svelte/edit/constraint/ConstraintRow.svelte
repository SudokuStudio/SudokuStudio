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

<div class="constraint-row" class:global={!isLocal} role="button" on:click|stopPropagation={onClick}>
    {#if isLocal}
        <input class="radio-select-button" type="radio" id="local-radio-{++counter}" value={id} name={selectedToolName} bind:group={$selectedTool} />
    {/if}
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

<style lang="scss">
    @use 'src/css/vars';
    @use 'src/css/clearfix';

    .unused {
        opacity: 0.5;
    }

    .constraint-row {
        @include clearfix.clearfix;

        margin: 0.25em 0 0.5em .75em;
        padding: 0.25em 0.25em;
        position: relative;
        white-space: nowrap;

        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        @include vars.hoverborder();
        &.global:hover {
            @include vars.hoverborder-hover();
        }

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;
        }

        z-index: 0;
    }

    .radio-select-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        position: absolute;
        top: -1 * vars.$hoverborder-size;
        left: -1 * vars.$hoverborder-size;
        width: calc(100% + #{2 * vars.$hoverborder-size});
        height: calc(100% + #{2 * vars.$hoverborder-size});

        pointer-events: none;

        border-color: transparent;
        z-index: -1;

        @include vars.hoverborder;

        &:checked {
            @include vars.hoverborder-hover();
            background-color: vars.$color-selected;
        }

        @include vars.hoverborder();
    }
    .constraint-row:hover .radio-select-button {
        @include vars.hoverborder-hover();
    }
</style>