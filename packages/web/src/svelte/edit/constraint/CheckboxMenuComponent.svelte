<script lang="ts">
    import type { StateRef } from "@sudoku-studio/state-manager";
    import type { CheckboxMenuComponent } from "../../../js/element/element";
    import ConstraintRow from "./ConstraintRow.svelte";
    import Checkbox from "./Checkbox.svelte";
    import { pushHistory } from "../../../js/history";

    export let id: string;
    export let ref: StateRef;
    export let info: CheckboxMenuComponent;

    function onClick() {
        if (!Array.isArray(info.checkbox)) {
            const diff = ref.replace(!ref.get<boolean>());
            pushHistory(diff);
        }
        else {
            const val = info.checkbox.some(({ refPath }) => !ref.ref(refPath).get<boolean>());
            const dict: Record<string, boolean> = {};
            for (const { refPath } of info.checkbox) {
                dict[refPath] = val;
            }
            const diff = ref.replace(dict);
            pushHistory(diff);
        }
    }

    function unused(data: any): boolean { // TODO? Do this somewhere else?
        if (!Array.isArray(info.checkbox)) {
            return !data;
        }
        else {
            return info.checkbox.every(({ refPath }) => !ref.ref(refPath).get<boolean>());
        }
    }
</script>

<ConstraintRow {id} name={info.name} unused={unused($ref)} onClick={onClick} >
    {#each (Array.isArray(info.checkbox) ? info.checkbox : [ info.checkbox ]) as { name, icon, refPath }}
        <Checkbox {name} {icon} checked={refPath ? ref.ref(refPath) : ref} />
    {/each}
</ConstraintRow>
