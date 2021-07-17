<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { SelectMenuComponent } from "../../../js/element/element";

    import ConstraintRow from "./ConstraintRow.svelte";

    export let id: string;
    export let elementRef: StateRef;
    export let info: SelectMenuComponent;
</script>

<ConstraintRow {id} name={info.name} unused={false} isLocal={true} onTrash={() => elementRef.replace(null)}>
    <span class="icon icon-inline icon-c-clickable icon-{info.icon}" />
</ConstraintRow>
