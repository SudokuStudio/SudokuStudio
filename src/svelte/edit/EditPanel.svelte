<script lang="ts">
    import EditSection from "./EditSection.svelte";

    import type { StateRef } from "../../js/state_manager";
    import { boardState, ConstraintMenuType, CONSTRAINT_MENU_TYPES, CONSTRAINT_COMPONENTS } from "../../js/board";
    import type { ConstraintComponent } from "../../js/board";

    type ConstraintList = { id: string, ref: StateRef, component: ConstraintComponent }[];
    const constraintsGlobal: ConstraintList = [];
    const constraintsLocal: ConstraintList = [];

    function getList(type: keyof typeof CONSTRAINT_MENU_TYPES): ConstraintList | null {
        const menuType = CONSTRAINT_MENU_TYPES[type];
        if (ConstraintMenuType.GLOBAL === menuType) return constraintsGlobal;
        if (ConstraintMenuType.LOCAL === menuType) return constraintsLocal;
        return null;
    }

    boardState.ref('elements/*').watch<schema.Constraint>(([ _elements, constraintId ], oldVal, newVal) => {
        const list = getList(oldVal?.type || newVal!.type);
        if (null == list) return;

        let i = -1;
        if (null != oldVal) {
            i = list.findIndex(({ id }) => constraintId === id);
            if (0 > i) {
                console.error(`Failed to find constraint with id ${constraintId}.`);
                return;
            }
        }

        if (null == newVal) {
            // Deleted.
            delete list[i!];
        }
        else {
            const component = CONSTRAINT_COMPONENTS[newVal.type];
            if (null == component) {
                console.error(`Cannot show edit menu for unknown constraint type: ${newVal.type}.`);
                return;
            }

            const item = {
                id: constraintId,
                ref: boardState.ref(_elements, constraintId, 'value'),
                component,
            };

            if (null == oldVal) {
                list.push(item);
            }
            else {
                if (oldVal.type !== newVal.type)
                    console.error('Cannot change type of constraint!');
                list[i] = item;
            }
        }
    }, true);

</script>
<ul class="nolist">
    <li>
        <EditSection title="Solver Panel">
            <p style="margin: 0; padding: 0.25em 1em;">Nothing Here!</p>
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
            <p style="margin: 0; padding: 0.25em 1em;">Nothing Here!</p>
        </EditSection>
    </li>
</ul>
