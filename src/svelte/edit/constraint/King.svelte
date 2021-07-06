<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintGlobal from "./ConstraintGlobal.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let ref: StateRef;
</script>

<ConstraintGlobal name="Antiking" unused={!$ref}>
    <Checkbox name="Toggle Antiking Constraint" icon="king" checked={ref} />
</ConstraintGlobal>
