<script lang="ts" context="module">
    let counter = 0;
</script>
<script type="ts">
    import { boardDiv } from "../../../js/board";
    import { userToolState, TOOL_INPUT_NAME, userPrevToolState } from "../../../js/user";

    export let id: string;
    export let name: string;
    export let unused: boolean;
    export let deletable: boolean;

    export let isLocal: boolean = false;
    export let onClick: svelte.JSX.MouseEventHandler<HTMLDivElement> | undefined =
        isLocal ? (() => $userPrevToolState = $userToolState = id) : undefined;

    export let onTrash: svelte.JSX.MouseEventHandler<HTMLButtonElement> | undefined = undefined;
</script>

<div class="constraint-row-container">
    {#if isLocal}
        <input class="radio-select-button" type="radio" id="local-radio-{++counter}" value={id} name={TOOL_INPUT_NAME}
            bind:group={$userToolState} />
        <button class="nobutton focus-skip" on:click={() => $boardDiv && $boardDiv.focus()}>Jump To Board</button>
    {/if}
    <div class="constraint-row" role="button" on:click|stopPropagation={onClick} title={isLocal ? `${name} Tool` : undefined} aria-labelledby="label-{counter}">
        <div class="constraint-row-left">
            {#if deletable}
                <button class="delete-button nobutton hoverable" on:click|stopPropagation={onTrash}>
                    <span class="icon hoverable-icon icon-inline icon-c-clickable icon-trash" />
                </button><!-- no whitespace
         -->{/if}{#if isLocal}
                <label class:unused={unused} class="name clickable" for="local-radio-{counter}" id="label-{counter}">{name}</label>
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
    @use "@material/ripple";
    @use 'src/css/vars';
    @use 'src/css/clearfix';

    .unused {
        opacity: 0.5;
    }

    .constraint-row-container {
        margin: 0.25em 0 0.5em 0em;
        position: relative;
    }

    .constraint-row {
        @include clearfix.clearfix;

        $padding: 0.25em;
        padding: $padding;

        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        @include vars.hoverborder();

        .constraint-row-left {
            float: left;

            padding-left: 1.5em;
            .delete-button {
                margin-left: -1.5em;
                width: 1.5em;
            }
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;
        }

        z-index: 0;
    }
    .radio-select-button:focus-visible {
        // TODO: pick our own color for keyboard accessibility.
        outline-offset: -0.1em;
    }
    .constraint-row:hover, .radio-select-button:focus-visible ~ .constraint-row  {
        @include vars.hoverborder-hover();
    }
    .radio-select-button:checked ~ .constraint-row {
        background-color: vars.$color-selected;
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