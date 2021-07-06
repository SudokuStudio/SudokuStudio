<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintGlobal from "./ConstraintGlobal.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let ref: StateRef;
</script>

<ConstraintGlobal name="Disjoint Groups" unused={!$ref}>
    <Checkbox name="Toggle Disjoint Groups Constraint" icon="disjoint" checked={ref} />
</ConstraintGlobal>
