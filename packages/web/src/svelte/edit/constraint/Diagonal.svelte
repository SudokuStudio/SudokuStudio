<script lang="ts">
    import type { StateRef } from "sudoku-studio-state-manager";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let id: string;
    export let ref: StateRef;

    const positive = ref.ref('positive');
    const negative = ref.ref('negative');

    function onClick() {
        const val = !$positive || !$negative;
        $ref = {
            positive: val,
            negative: val,
        };
    }
</script>

<ConstraintRow {id} name="Diagonals" unused={!$positive && !$negative} onClick={onClick} >
    <Checkbox name="Toggle Positive Diagonal" icon="positive-diagonal" checked={positive} />
    <Checkbox name="Toggle Negative Diagonal" icon="negative-diagonal" checked={negative} />
</ConstraintRow>
