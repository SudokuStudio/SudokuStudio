<script lang="ts">
    import EditSection from "./EditSection.svelte";

    import type { StateRef } from "../../js/state_manager";
    import { boardState, CONSTRAINT_COMPONENTS } from "../../js/board";
    import type { ConstraintComponent } from "../../js/board";
    import ConstraintRow from "./constraint/ConstraintRow.svelte";
import Icon from "../Icon.svelte";

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
            <ul class="nolist">
                {#each constraintsGlobal as { id, ref, component } (id)}
                    <li>
                        <svelte:component this={component} {id} {ref}  />
                    </li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints">
            <ul class="nolist">
                <li>
                    <ConstraintRow id="10101" name="Digit" unused={false} isLocal={true}>
                        <Icon icon="given" color="text" />
                    </ConstraintRow>
                </li>
                <li>
                    <ConstraintRow id="13212" name="Thermo" unused={false} isLocal={true}>
                        <Icon icon="thermo" color="text" />
                    </ConstraintRow>
                </li>
                <li>
                    <ConstraintRow id="567567" name="Arrow" unused={false} isLocal={true}>
                        <Icon icon="arrow" color="text" />
                    </ConstraintRow>
                </li>
                <li>
                    <ConstraintRow id="348445" name="Sandwich" unused={false} isLocal={true}>
                        <Icon icon="sandwich" color="text" />
                    </ConstraintRow>
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
