<script lang="ts">
    import ConstraintRow from "../ConstraintRow.svelte";
    import ConstraintToggle from "../ConstraintToggle.svelte";

    export let value: boolean;
</script>

<ConstraintRow name="Antiknight">
    <ConstraintToggle name="Toggle Anitknight Constraint" icon="knight" checked={value} on:input />
</ConstraintRow>
