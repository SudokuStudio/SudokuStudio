<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let id: string;
    export let ref: StateRef;
</script>

<ConstraintRow {id} name="Nonconsecutive" unused={!$ref} onClick={() => $ref = !$ref}>
    <Checkbox name="Toggle Nonconsecutive Constraint" icon="nonconsecutive" checked={ref} />
</ConstraintRow>
