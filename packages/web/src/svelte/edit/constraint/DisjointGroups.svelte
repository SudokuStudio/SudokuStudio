<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let id: string;
    export let ref: StateRef;
</script>

<ConstraintRow {id} name="Disjoint Groups" unused={!$ref} onClick={() => $ref = !$ref}>
    <Checkbox name="Toggle Disjoint Groups Constraint" icon="disjoint" checked={ref} />
</ConstraintRow>
