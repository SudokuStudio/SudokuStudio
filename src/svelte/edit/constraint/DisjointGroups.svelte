<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let ref: StateRef;
</script>

<ConstraintRow name="Disjoint Groups" unused={!$ref}>
    <ConstraintToggle name="Toggle Disjoint Groups Constraint" icon="disjoint" checked={ref} />
</ConstraintRow>
