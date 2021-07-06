<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import ConstraintToggle from "./ConstraintToggle.svelte";

    export let ref: StateRef;

    const positive = ref.ref('positive');
    const negative = ref.ref('negative');
</script>

<ConstraintRow name="Diagonals" unused={!$positive && !$negative} >
    <ConstraintToggle name="Toggle Positive Diagonal" icon="positive-diagonal" checked={positive} />
    <ConstraintToggle name="Toggle Negative Diagonal" icon="negative-diagonal" checked={negative} />
</ConstraintRow>
