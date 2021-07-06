<script lang="ts">
    import EditSection from "./EditSection.svelte";

    import type { StateRef } from "../../js/state_manager";
    import { boardState, CONSTRAINT_COMPONENTS } from "../../js/board";
    import type { ConstraintComponent } from "../../js/board";

    const constraintsGlobal: { id: string, ref: StateRef, component: ConstraintComponent }[] = [];

    boardState.ref('constraints/*').watch<schema.Constraint>(([ constraints, constraintId ], oldVal, newVal) => {
        if (null == newVal) {
            // Deleted.
            const i = constraintsGlobal.findIndex(({ id }) => constraintId === id);
            if (0 > i) throw Error(`Failed to find constraint with id ${constraintId}.`);
            delete constraintsGlobal[i];
        }
        else {
            const component = CONSTRAINT_COMPONENTS[newVal.type];
            if (null == component) throw Error(`Unknown constraint type: ${newVal.type}.`);

            if (null == oldVal) {
                constraintsGlobal.push({
                    id: constraintId,
                    ref: boardState.ref(constraints, constraintId, 'value'),
                    component,
                });
            }
            else {
                if (oldVal.type !== newVal.type)
                    console.error('Cannot change type of constraint!');
                // TODO: handle metadata?
            }
        }
    }, true);

</script>
<ul class="nolist">
    <li>
        <EditSection title="Solver Panel">
            Nothing Here!
        </EditSection>
    </li>
    <li>
        <EditSection title="Global Constraints">
            {#each constraintsGlobal as { id, ref, component } (id)}
                <svelte:component this={component} {ref} />
            {/each}
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints">
            <ul>
                <li>
                    <input
                        type="radio"
                        id="digitTool"
                        name="localConstraints"
                        checked
                    />
                    <label for="digitTool"> Digit </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="thermoTool"
                        name="localConstraints"
                    />
                    <label for="thermoTool"> Thermo </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="arrowTool"
                        name="localConstraints"
                    />
                    <label for="arrowTool"> Arrow </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="sandwichTool"
                        name="localConstraints"
                    />
                    <label for="sandwichTool"> Sandwich </label>
                </li>
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Cosmetic Tools">
            Nothing Here!
        </EditSection>
    </li>
</ul>

<style lang="scss">
</style>
