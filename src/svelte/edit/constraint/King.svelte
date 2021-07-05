<script lang="ts">
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let value: boolean;
</script>

<ConstraintRow name="Antiking">
    <ConstraintToggle name="Toggle Antiking Constraint" icon="king" checked={value} />
</ConstraintRow>
