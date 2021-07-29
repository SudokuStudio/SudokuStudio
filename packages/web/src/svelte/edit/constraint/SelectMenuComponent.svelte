<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { SelectMenuComponent } from "../../../js/element/element";
    import { removeElement } from "../../../js/elementStores";

    import ConstraintRow from "./ConstraintRow.svelte";

    export let id: string;
    export let elementRef: StateRef;
    export let info: SelectMenuComponent;
    export let deletable: boolean;

    // @ts-ignore
    const _unused = elementRef;
</script>

<ConstraintRow {id} {deletable} name={info.name} unused={false} isLocal={true} onTrash={() => removeElement(id)}>
    <span class="icon icon-inline icon-c-clickable icon-{info.icon}" />
</ConstraintRow>
