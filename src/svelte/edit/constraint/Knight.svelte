<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let id: string;
    export let ref: StateRef;
</script>

<ConstraintRow {id} name="Antiknight" unused={!$ref} onClick={() => $ref = !$ref}>
    <Checkbox name="Toggle Antiknight Constraint" icon="knight" checked={ref} />
</ConstraintRow>
