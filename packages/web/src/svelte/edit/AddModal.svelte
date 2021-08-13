<script lang="ts">
    import { search } from "../../js/elements";
    import Modal from "../Modal.svelte";

    export let visible = false;

    let searchPattern: string = '';

    (window as any).showAddModal = () => visible = true;
</script>

<Modal bind:visible={visible}>
    <div class="search-input-container">
        <span class="icon hoverable-icon icon-inline icon-c-clickable icon-search" />
        <input class="search-input" type="text" bind:value={searchPattern} />
    </div>
    <div class="search-results">
        <pre><code>{JSON.stringify(search(searchPattern)
            .filter(({ score }) => null != score ? score <= 0.35 : false)
            .map(({ score, item }) => ({ score, name: item.info?.menu?.name })), null, 2)}</code></pre>
    </div>
</Modal>

<style lang="scss">
    @use '../../css/vars' as vars;

    .search-input-container {
        padding: 0.5em;

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
</style>
