<script type="ts" context="module">
    export type Item = {
        id: string,
        name: string,
        icon: string,
    };
</script>
<script type="ts">
    import Icon from "./Icon.svelte";

    export let name: string;
    export let items: Item[];

</script>

<div class="constraint-row">
    <div class="constraint-row-left">
        <Icon icon="trash" />
        {name}
    </div>
    <div class="constraint-row-right">
        {#each items as { id, name, icon } (id)}
            <div class="constraint-iconbutton">
                <label for="checkbox-{id}">
                    <Icon {icon} />
                    <span class="sr-only">{name}</span>
                </label>
                <input id="checkbox-{id}" type="checkbox" />
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    @use '../css/vars';
    @use '../css/clearfix';

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