<script lang="ts">
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let value: {
        positive: boolean,
        negative: boolean,
    };
</script>

<ConstraintRow name="Diagonals">
    <ConstraintToggle name="Toggle Positive Diagonal" icon="positive-diagonal" checked={value.positive} on:input />
    <ConstraintToggle name="Toggle Negative Diagonal" icon="negative-diagonal" checked={value.negative} on:input />
</ConstraintRow>
