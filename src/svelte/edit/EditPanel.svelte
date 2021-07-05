<script lang="ts">
    import ConstraintList from "./ConstraintList.svelte";
    import EditSection from "./EditSection.svelte";

    import { globalConstraints } from "../../js/board";
    import type { ConstraintDataAndComponent } from "../../js/board";

    let globalConstraintsList: ConstraintDataAndComponent[] = [];
    globalConstraints.subscribe(value => globalConstraintsList = value)
</script>
<ul class="nolist">
    <li>
        <EditSection title="Solver Panel">
            Nothing Here!
        </EditSection>
    </li>
    <li>
        <EditSection title="Global Constraints">
            {#each globalConstraintsList as { id: _, value, component }}
                <svelte:component this={component} {value} />
            {/each}
        </EditSection>
    </li>
    <li>
        <EditSection title="Global Constraints">
            <ConstraintList />
        </EditSection>
    </li>
    <li>
        <EditSection title="Local Constraints">
            <ul>
                <li>
                    <input
                        type="radio"
                        id="digitTool"
                        name="localConstraints"
                        checked
                    />
                    <label for="digitTool"> Digit </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="thermoTool"
                        name="localConstraints"
                    />
                    <label for="thermoTool"> Thermo </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="arrowTool"
                        name="localConstraints"
                    />
                    <label for="arrowTool"> Arrow </label>
                </li>
                <li>
                    <input
                        type="radio"
                        id="sandwichTool"
                        name="localConstraints"
                    />
                    <label for="sandwichTool"> Sandwich </label>
                </li>
            </ul>
        </EditSection>
    </li>
    <li>
        <EditSection title="Cosmetic Tools">
            Nothing Here!
        </EditSection>
    </li>
</ul>

<style lang="scss">
</style>
