<script lang="ts">
    import type { ElementHandlerList } from "../../js/board";

    import EditSection from "./EditSection.svelte";
    import { elementHandlers } from "../../js/board";
    import { derived } from "svelte/store";


    const constraintsGlobal = derived<typeof elementHandlers, ElementHandlerList>(elementHandlers, $elementHandlers => {
        return $elementHandlers.filter(({ handler }) => handler.MenuComponent && handler.isGlobal);
    });
    const constraintsLocal = derived<typeof elementHandlers, ElementHandlerList>(elementHandlers, $elementHandlers => {
        return $elementHandlers.filter(({ handler }) => handler.MenuComponent && !handler.isGlobal);
    });
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
                {#each $constraintsGlobal as { id, valueRef, handler } (id)}
                    <li>
                        <svelte:component this={handler.MenuComponent} {id} ref={valueRef}  />
                    </li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints">
            <ul class="nolist">
                {#each $constraintsLocal as { id, valueRef, handler } (id)}
                    <li>
                        <svelte:component this={handler.MenuComponent} {id} ref={valueRef}  />
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
