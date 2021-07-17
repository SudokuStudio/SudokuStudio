<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { CheckboxMenuComponent } from "../../../js/element/element";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";
    import { pushHistory } from "../../../js/history";

    export let id: string;
    export let elementRef: StateRef;
    export let info: CheckboxMenuComponent;

    const valueRef = elementRef.ref('value');

    function onClick() {
        if (!Array.isArray(info.checkbox)) {
            const diff = valueRef.replace(!valueRef.get<boolean>());
            pushHistory(diff);
        }
        else {
            const val = info.checkbox.some(({ refPath }) => !valueRef.ref(refPath).get<boolean>());
            const dict: Record<string, boolean> = {};
            for (const { refPath } of info.checkbox) {
                dict[refPath] = val;
            }
            const diff = valueRef.replace(dict);
            pushHistory(diff);
        }
    }

    function unused(data: any): boolean { // TODO? Do this somewhere else?
        if (!Array.isArray(info.checkbox)) {
            return !data;
        }
        else {
            return info.checkbox.every(({ refPath }) => !valueRef.ref(refPath).get<boolean>());
        }
    }
</script>

<ConstraintRow {id} name={info.name} unused={unused($valueRef)} onClick={onClick} onTrash={() => elementRef.replace(null)}>
    {#each (Array.isArray(info.checkbox) ? info.checkbox : [ info.checkbox ]) as { name, icon, refPath }}
        <Checkbox {name} {icon} checked={refPath ? valueRef.ref(refPath) : valueRef} />
    {/each}
</ConstraintRow>
