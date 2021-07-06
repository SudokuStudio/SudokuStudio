<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import ConstraintToggle from "./ConstraintToggle.svelte";

    export let ref: StateRef;
</script>

<ConstraintRow name="Nonconsecutive" unused={!$ref}>
    <ConstraintToggle name="Toggle Nonconsecutive Constraint" icon="nonconsecutive" checked={ref} />
</ConstraintRow>
