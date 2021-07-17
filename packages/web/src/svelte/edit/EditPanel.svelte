<script lang="ts">
    import type { ElementHandlerList } from "../../js/elementStores";
    import { addElement } from "../../js/elementStores";
    import type { ElementInfo } from "../../js/element/element";

    import EditSection from "./EditSection.svelte";
    import { elementHandlers } from "../../js/elementStores";
    import { derived } from "svelte/store";
    import SelectMenuComponent from "./constraint/SelectMenuComponent.svelte";
    import CheckboxMenuComponent from "./constraint/CheckboxMenuComponent.svelte";
    import { ELEMENT_HANDLERS } from "../../js/elements";

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

    function showAddModal(_global: boolean): void {
        const type = window.prompt('TEMPORARY. Enter element type string:\n'
            + Object.keys(ELEMENT_HANDLERS).join(', '));
        if (null == type) return;
        try {
            addElement(type as any);
        }
        catch (e) {
            alert(`Unknown element type string: ${JSON.stringify(type)}`)
        }
    }
</script>

<ul class="nolist">
    <li>
        <EditSection title="Solver Panel">
            <div class="empty-placeholder">Nothing here!</div>
        </EditSection>
    </li>
    <li>
        <EditSection title="Global Constraints" onAdd={() => showAddModal(true)}>
            <ul class="nolist">
                {#each $constraintsGlobal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef} deletable={!info.permanent}  />
                    </li>
                {:else}
                    <li><div class="empty-placeholder">Nothing here!</div></li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints" onAdd={() => showAddModal(false)}>
            <ul class="nolist">
                {#each $constraintsLocal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef} deletable={!info.permanent}  />
                    </li>
                {:else}
                    <li><div class="empty-placeholder">Nothing here!</div></li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Cosmetic Tools">
            <div class="empty-placeholder">Nothing here!</div>
        </EditSection>
    </li>
</ul>

<style lang="scss">
    .empty-placeholder {
        padding: 0.25em 0 0.25em 1.75em;
    }
</style>