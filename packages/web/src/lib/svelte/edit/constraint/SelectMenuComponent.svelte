<script lang="ts">
    import type { StateRef } from '@sudoku-studio/state-manager/src';
    import type { SelectMenuInfo } from '../../../js/element/element';
    import { removeElement } from '../../../js/elementStores';

    import ConstraintRow from './ConstraintRow.svelte';

    export let id: string;
    export let elementRef: StateRef;
    export let info: SelectMenuInfo;
    export let deletable: boolean;

    const _unused = elementRef;
</script>

<ConstraintRow {id} {deletable} name={info.name} unused={false} isLocal={true} onTrash={() => removeElement(id)}>
    <span class="icon icon-inline icon-c-clickable icon-{info.icon}"></span>
</ConstraintRow>
