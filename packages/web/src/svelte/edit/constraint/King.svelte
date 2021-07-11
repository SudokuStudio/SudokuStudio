<script lang="ts">
    import type { StateRef } from "sudoku-studio-state-manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let id: string;
    export let ref: StateRef;
</script>

<ConstraintRow {id} name="Antiking" unused={!$ref} onClick={() => $ref = !$ref}>
    <Checkbox name="Toggle Antiking Constraint" icon="king" checked={ref} />
</ConstraintRow>
