<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";
    import ConstraintGlobal from "./ConstraintGlobal.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let ref: StateRef;
</script>

<ConstraintGlobal name="Nonconsecutive" unused={!$ref}>
    <Checkbox name="Toggle Nonconsecutive Constraint" icon="nonconsecutive" checked={ref} />
</ConstraintGlobal>
