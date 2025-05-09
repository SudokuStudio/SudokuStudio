<script lang="ts">
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { CheckboxMenuComponent } from '$lib/js/element/element';
    import ConstraintRow from './ConstraintRow.svelte';
    import Checkbox from './Checkbox.svelte';
    import { pushHistory } from '$lib/js/history';
    import { removeElement } from '$lib/js/elementStores';

    export let id: string;
    export let elementRef: StateRef<{ value?: boolean | Record<string, boolean> }>;
    export let info: CheckboxMenuComponent;
    export let deletable: boolean;

    const valueRef = elementRef.ref<boolean | Record<string, boolean>>('value');

    function onClick() {
        if (!Array.isArray(info.checkbox)) {
            const diff = valueRef.replace(!valueRef.get());
            pushHistory(diff);
        } else {
            const val = info.checkbox.some(({ refPath }) => !valueRef.ref<boolean>(refPath).get());
            const dict: Record<string, boolean> = {};
            for (const { refPath } of info.checkbox) {
                dict[refPath] = val;
            }
            const diff = valueRef.replace(dict);
            pushHistory(diff);
        }
    }

    function unused(data: any): boolean {
        // TODO? Do this somewhere else?
        if (!Array.isArray(info.checkbox)) {
            return !data;
        } else {
            return info.checkbox.every(({ refPath }) => !valueRef.ref<boolean>(refPath).get());
        }
    }
</script>

<ConstraintRow {id} {deletable} name={info.name} unused={unused($valueRef)} {onClick} onTrash={() => removeElement(id)}>
    {#each Array.isArray(info.checkbox) ? info.checkbox : [info.checkbox] as { name, icon, refPath }}
        <Checkbox {name} {icon} checked={refPath ? valueRef.ref<boolean>(refPath) : (valueRef as StateRef<boolean>)} />
    {/each}
</ConstraintRow>
