<script lang="ts">
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { SelectMenuComponent } from '@sudoku-studio/elements-schema';
    import { removeElement } from '$lib/js/elementStores';

    import ConstraintRow from './ConstraintRow.svelte';

    export let id: string;
    export let elementRef: StateRef<any>;
    export let info: SelectMenuComponent;
    export let deletable: boolean;

    const _unused = elementRef;
</script>

<ConstraintRow {id} {deletable} name={info.name} unused={false} isLocal={true} onTrash={() => removeElement(id)}>
    <span class="icon icon-inline icon-c-clickable icon-{info.icon}"></span>
</ConstraintRow>
