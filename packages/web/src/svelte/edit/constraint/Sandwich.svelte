<script lang="ts">
    import type { StateRef } from "sudoku-studio-state-manager";

    import ConstraintRow from "./ConstraintRow.svelte";

    export let id: string;
    export let ref: StateRef;

    $ref; // TODO UNUSED.
</script>

<ConstraintRow id={id} name="Sandwich" unused={false} isLocal={true}>
    <span class="icon icon-inline icon-c-clickable icon-sandwich" />
</ConstraintRow>
