<script lang="ts" context="module">
    import type { SvelteComponent } from "svelte";

    type ConstraintRefAndComponent = {
        id: string,
        ref: StateRef,
        component: SvelteComponentConstructor<SvelteComponent, any>,
    };
</script>
<script lang="ts">
    import type { schema } from "@sudoku-studio/schema";
    import type { StateRef } from "@sudoku-studio/state-manager";

    import EditSection from "./EditSection.svelte";
    import { boardState } from "../../js/board";
    import { ELEMENT_HANDLERS } from "../../js/elements";

    // type ConstraintList = { id: string, ref: StateRef, component: ConstraintDataAndComponent }[];
    type ConstraintList = ConstraintRefAndComponent[];
    const constraintsGlobal: ConstraintList = [];
    const constraintsLocal: ConstraintList = [];

    boardState.ref('elements/*').watch<schema.Element>(([ _elements, constraintId ], oldVal, newVal) => {
        const type = oldVal?.type || newVal!.type;
        const elementHandler = ELEMENT_HANDLERS[type];
        if (null == elementHandler) {
            console.warn(`Cannot show edit menu for unknown constraint type: ${type}.`);
            return;
        }

        const list = elementHandler.IS_GLOBAL ? constraintsGlobal : constraintsLocal;

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
            const component = elementHandler.MenuComponent;
            if (null == component) {
                console.warn(`Cannot show edit menu for unknown constraint type: ${newVal.type}.`);
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
