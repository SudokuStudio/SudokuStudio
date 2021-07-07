<script lang="ts">
    import type { StateRef } from "../../../js/state_manager";

    import Icon from "../../Icon.svelte";
    import ConstraintRow from "./ConstraintRow.svelte";

    export let id: string;
    export let ref: StateRef;

    $ref; // TODO UNUSED.
</script>

<ConstraintRow id={id} name="Thermos" unused={false} isLocal={true}>
    <Icon icon="thermo" color="text" />
</ConstraintRow>
