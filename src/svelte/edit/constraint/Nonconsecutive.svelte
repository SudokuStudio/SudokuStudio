<script lang="ts">
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let value: boolean;
</script>

<ConstraintRow name="Nonconsecutive">
    <ConstraintToggle name="Toggle Nonconsecutive Constraint" icon="nonconsecutive" checked={value} />
</ConstraintRow>
