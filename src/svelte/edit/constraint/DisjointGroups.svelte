<script lang="ts">
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let value: boolean;
</script>

<ConstraintRow name="Disjoint Groups">
    <ConstraintToggle name="Toggle Disjoint Groups Constraint" icon="disjoint" checked={value} />
</ConstraintRow>
