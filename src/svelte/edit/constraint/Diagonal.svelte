<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let ref: StateRef;
</script>

<ConstraintRow name="Diagonals">
    <ConstraintToggle name="Toggle Positive Diagonal" icon="positive-diagonal" ref={ref.ref('positive')} />
    <ConstraintToggle name="Toggle Negative Diagonal" icon="negative-diagonal" ref={ref.ref('negative')} />
</ConstraintRow>
