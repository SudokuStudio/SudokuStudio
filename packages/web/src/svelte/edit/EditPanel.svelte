<script lang="ts">
    import type { ElementHandlerList } from "../../js/elementStores";
    import type { ElementInfo } from "../../js/element/element";

    import EditSection from "./EditSection.svelte";
    import { elementHandlers } from "../../js/elementStores";
    import { derived } from "svelte/store";
    import SelectMenuComponent from "./constraint/SelectMenuComponent.svelte";
    import CheckboxMenuComponent from "./constraint/CheckboxMenuComponent.svelte";

    const constraintsGlobal = derived<typeof elementHandlers, ElementHandlerList>(elementHandlers, $elementHandlers => {
        return $elementHandlers.filter(({ info }) => info.menu && info.inGlobalMenu);
    });
    const constraintsLocal = derived<typeof elementHandlers, ElementHandlerList>(elementHandlers, $elementHandlers => {
        return $elementHandlers.filter(({ info }) => info.menu && !info.inGlobalMenu);
    });

    function componentFor(element: ElementInfo) {
        const menuInfo = element.menu;
        if (null == menuInfo) return null;
        return function(args: any) {
            if ('select' === menuInfo.type) {
                args.props.info = menuInfo;
                return new SelectMenuComponent(args);
            }
            if ('checkbox' === menuInfo.type) {
                args.props.info = menuInfo;
                return new CheckboxMenuComponent(args);
            }
            throw Error(`Unknown menu type "${(menuInfo as any).type}".`);
        };
    }
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
                {#each $constraintsGlobal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef}  />
                    </li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints">
            <ul class="nolist">
                {#each $constraintsLocal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef}  />
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
