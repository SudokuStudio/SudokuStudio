<script>
import ConstraintList from "./ConstraintList.svelte";
import EditSection from "./EditSection.svelte";
import Icon from "./Icon.svelte";

</script>
<ul class="nolist">
    <li>
        <EditSection title="Solver Panel">
            Nothing Here!
        </EditSection>
    </li>
    <li>
        <EditSection title="Global Constraints">
            <ConstraintList />
        </EditSection>
    </li>
    <li>
        <h4 class="section-title">
            <Icon icon="tree-menu-shown" />
            Local Constraints
        </h4>
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
    </li>
    <li>
        <h4 class="section-title">
            <Icon icon="tree-menu-hidden" />
            Cosmetic Tools
        </h4>
    </li>
</ul>

<style lang="scss">
</style>
