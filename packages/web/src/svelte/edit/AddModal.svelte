<script lang="ts">
    import { search } from "../../js/elements";
    import { addElement } from "../../js/elementStores";
    import Modal from "../Modal.svelte";

    export let visible = false;

    let searchInput: HTMLInputElement = null!;
    let searchPattern: string = '';

    function elementClicked(type: string): void {
        addElement(type as any);
        visible = false;
    }

    $: visible && setTimeout(() => searchInput.select(), 0);
</script>

<Modal bind:visible={visible}>
    <div class="search-input-container">
        <span class="icon hoverable-icon icon-inline icon-c-clickable icon-search" />
        <input class="search-input" type="text" bind:this={searchInput} bind:value={searchPattern} />
    </div>
    <div class="search-results">
        <ol class="nolist">
            {#each search(searchPattern) as { score: _, item }}
                <li>
                    <button class="result-item nobutton hoverable" title={item.info.meta?.description} on:click={() => elementClicked(item.key)}>
                        <span class="icon hoverable-icon icon-inline icon-c-clickable icon-{item.info.menu?.icon}" />
                        {item.info.menu?.name}
                    </button>
                </li>
            {/each}
        </ol>
    </div>
</Modal>

<style lang="scss">
    @use '../../css/vars' as vars;

    .search-input-container {
        padding: 0.5em;
        margin-bottom: 0.5em;

        @include vars.hoverborder();
        @include vars.hoverborder-hover();

        display: flex;
        align-items: baseline;
    }

    .search-input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        margin: 0 0 0 0.5em;
        padding: 0;
        border: 0;
        outline: none;

        display: inline-block;

        flex: 1;
    }

    .search-results {
        height: 75vh;
        overflow: auto;
    }

    .result-item {
        width: 100%;
        margin: 0.25em 0 0 0;
        padding: 0.25em;
        text-align: inherit;

        @include vars.hoverborder();
        &:hover, &:focus-visible {
            @include vars.hoverborder-hover();
        }
    }
</style>
