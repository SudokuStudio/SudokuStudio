<script lang="ts">
    import EditSection from "./EditSection.svelte";

    import type { StateRef } from "../../js/state_manager";
    import { boardState, CONSTRAINT_GLOBALS, CONSTRAINT_COMPONENTS } from "../../js/board";
    import type { ConstraintComponent } from "../../js/board";

    const constraintsGlobal: { id: string, ref: StateRef, component: ConstraintComponent }[] = [];
    const constraintsLocal: { id: string, ref: StateRef, component: ConstraintComponent }[] = [];

    boardState.ref('constraints/*').watch<schema.Constraint>(([ constraints, constraintId ], oldVal, newVal) => {
        if (null == newVal) {
            // Deleted.
            const list = CONSTRAINT_GLOBALS[oldVal!.type] ? constraintsGlobal : constraintsLocal;

            const i = list.findIndex(({ id }) => constraintId === id);
            if (0 > i) throw Error(`Failed to find constraint with id ${constraintId}.`);
            delete list[i];
        }
        else {
            const list = CONSTRAINT_GLOBALS[newVal.type] ? constraintsGlobal : constraintsLocal;

            const component = CONSTRAINT_COMPONENTS[newVal.type];
            if (null == component) {
                console.error(`Unknown constraint type: ${newVal.type}.`);
                return;
            }

            if (null == oldVal) {
                list.push({
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
                {#each constraintsLocal as { id, ref, component } (id)}
                    <li>
                        <svelte:component this={component} {id} {ref}  />
                    </li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Cosmetic Tools">
            Nothing Here!
        </EditSection>
    </li>
</ul>
