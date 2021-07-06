<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintGlobal from "./ConstraintGlobal.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let ref: StateRef;

    const positive = ref.ref('positive');
    const negative = ref.ref('negative');
</script>

<ConstraintGlobal name="Diagonals" unused={!$positive && !$negative} >
    <Checkbox name="Toggle Positive Diagonal" icon="positive-diagonal" checked={positive} />
    <Checkbox name="Toggle Negative Diagonal" icon="negative-diagonal" checked={negative} />
</ConstraintGlobal>
