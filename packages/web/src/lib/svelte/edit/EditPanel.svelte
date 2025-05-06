<script lang="ts">
    import type { Component, ComponentInternals, ComponentProps } from 'svelte';
    import type { ElementHandlerList } from '$lib/js/elementStores';
    import type { ElementInfo, AbstractMenuProps } from '$lib/js/element/element';
    import EditSection from './EditSection.svelte';
    import { elementHandlers } from '$lib/js/elementStores';
    import { derived } from 'svelte/store';
    import SelectMenuComponent from './constraint/SelectMenuComponent.svelte';
    import CheckboxMenuComponent from './constraint/CheckboxMenuComponent.svelte';
    import SatSolver from './solver/SatSolver.svelte';
    import AddModal from './AddModal.svelte';

    function isNewConstraint(key: string): boolean {
        return !$elementHandlers.some(({ type }) => key === type);
    }

    function isGlobalConstraint(info: ElementInfo): boolean {
        return null != info.menu && !!info.inGlobalMenu;
    }

    function isLocalConstraint(info: ElementInfo): boolean {
        return null != info.menu && !info.inGlobalMenu;
    }

    const constraintsGlobal = derived<typeof elementHandlers, ElementHandlerList>(
        elementHandlers,
        ($elementHandlers) => {
            return $elementHandlers.filter(({ info }) => isGlobalConstraint(info));
        },
    );
    const constraintsLocal = derived<typeof elementHandlers, ElementHandlerList>(
        elementHandlers,
        ($elementHandlers) => {
            return $elementHandlers.filter(({ info }) => isLocalConstraint(info));
        },
    );

    const globalConstraintFilter = (key: string, info: ElementInfo) => isNewConstraint(key) && isGlobalConstraint(info);
    const localConstraintFilter = (key: string, info: ElementInfo) => isNewConstraint(key) && isLocalConstraint(info);

    function componentFor(element: ElementInfo): Component<AbstractMenuProps> | null {
        const menuInfo = element.menu;
        if (null == menuInfo) return null;
        return (internals: ComponentInternals, props: AbstractMenuProps) => {
            if ('select' === menuInfo.type) {
                props.info = menuInfo;
                return SelectMenuComponent(internals, props as ComponentProps<typeof SelectMenuComponent>);
            }
            if ('checkbox' === menuInfo.type) {
                props.info = menuInfo;
                return CheckboxMenuComponent(internals, props as ComponentProps<typeof CheckboxMenuComponent>);
            }
            throw Error(`Unknown menu type "${(menuInfo as { type: unknown }).type}".`);
        };
    }

    let modalSearchPattern = '';
    let showAddModal: boolean = false;
    let constraintFilterFunction = (_key: string, _info: ElementInfo) => true;
</script>

<ul class="nolist">
    <li>
        <EditSection icon="computer" title="Solver Panel">
            <ul class="nolist">
                <li>
                    <SatSolver />
                </li>
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection
            icon="globe"
            title="Global Constraints"
            onAdd={() => {
                showAddModal = true;
                modalSearchPattern = '';
                constraintFilterFunction = globalConstraintFilter;
            }}
        >
            <ul class="nolist">
                {#each $constraintsGlobal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef} deletable={!info.permanent} />
                    </li>
                {:else}
                    <li><div class="empty-placeholder">Nothing here!</div></li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection
            icon="location"
            title="Local Constraints"
            onAdd={() => {
                showAddModal = true;
                modalSearchPattern = '';
                constraintFilterFunction = localConstraintFilter;
            }}
        >
            <ul class="nolist">
                {#each $constraintsLocal as { id, elementRef, info } (id)}
                    <li>
                        <svelte:component this={componentFor(info)} {id} {elementRef} deletable={!info.permanent} />
                    </li>
                {:else}
                    <li><div class="empty-placeholder">Nothing here!</div></li>
                {/each}
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection icon="pencil" title="Cosmetic Tools">
            <div class="empty-placeholder">Nothing here!</div>
        </EditSection>
    </li>
</ul>

<AddModal
    bind:visible={showAddModal}
    bind:searchPattern={modalSearchPattern}
    filterFunction={constraintFilterFunction}
/>

<style lang="scss">
    .empty-placeholder {
        padding: 0.25em 0 0.25em 1.75em;
    }
</style>
