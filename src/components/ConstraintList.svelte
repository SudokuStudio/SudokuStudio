<script>
import Icon from "./Icon.svelte";

</script>
<ul class="nolist">
    <!-- diagonals -->
    <li>
        <div class="constraint-row">
            <div class="constraint-row-left">
                <Icon icon="trash" />
                Diagonals
            </div>
            <div class="constraint-row-right">
                <div class="constraint-iconbutton">
                    <label
                        for="constraint-diagonal-positive"
                    >
                        <Icon icon="positive-diagonal" />
                        <span class="sr-only"
                            >Positive Diagonal
                            Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-diagonal-positive"
                        type="checkbox"
                        name="constraint-diagonal-positive"
                    />
                </div>
                <div class="constraint-iconbutton">
                    <label
                        for="constraint-diagonal-negative"
                    >
                        <Icon icon="negative-diagonal" />
                        <span class="sr-only"
                            >Negative Diagonal
                            Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-diagonal-negative"
                        type="checkbox"
                        name="constraint-diagonal-negative"
                    />
                </div>
            </div>
        </div>
    </li>
    <!-- antiknight -->
    <li>
        <div class="constraint-row">
            <div class="constraint-row-left">
                <Icon icon="trash" />
                Antiknight
                <span
                    class="icon icon-inline icon-c-warning icon-warning"
                />
            </div>
            <div class="constraint-row-right">
                <div class="constraint-iconbutton">
                    <label for="constraint-knight">
                        <Icon icon="knight" />
                        <span class="sr-only"
                            >Antiknight Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-knight"
                        type="checkbox"
                        name="constraint-knight"
                    />
                </div>
            </div>
        </div>
    </li>
    <!-- antiking -->
    <li>
        <div class="constraint-row">
            <div class="constraint-row-left">
                <Icon icon="trash" />
                Antiking
                <span
                    class="icon icon-inline icon-c-warning icon-warning"
                />
            </div>
            <div class="constraint-row-right">
                <div class="constraint-iconbutton">
                    <label for="constraint-king">
                        <Icon icon="king" />
                        <span class="sr-only"
                            >Antiking Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-king"
                        type="checkbox"
                        name="constraint-king"
                    />
                </div>
            </div>
        </div>
    </li>
    <!-- disjoint groups -->
    <li>
        <div class="constraint-row">
            <div class="constraint-row-left">
                <Icon icon="trash" />
                Disjoint Groups
                <span
                    class="icon icon-inline icon-c-warning icon-warning"
                />
            </div>
            <div class="constraint-row-right">
                <div class="constraint-iconbutton">
                    <label for="constraint-disjoint">
                        <Icon icon="disjoint" />
                        <span class="sr-only"
                            >Disjoin Groups Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-disjoint"
                        type="checkbox"
                        name="constraint-disjoint"
                    />
                </div>
            </div>
        </div>
    </li>
    <!-- nonconsecutive -->
    <li>
        <div class="constraint-row">
            <div class="constraint-row-left">
                <Icon icon="trash" />
                Nonconsecutive
                <span
                    class="icon icon-inline icon-c-warning icon-warning"
                />
            </div>
            <div class="constraint-row-right">
                <div class="constraint-iconbutton">
                    <label for="constraint-consec">
                        <Icon icon="consec" />
                        <span class="sr-only"
                            >Nonconsecutive Constraint</span
                        >
                    </label>
                    <input
                        id="constraint-consec"
                        type="checkbox"
                        name="constraint-consec"
                    />
                </div>
            </div>
        </div>
    </li>
</ul>

<style lang="scss">
    @use '../styles/vars';
    @use '../styles/clearfix';

    .constraint-row {
        @include clearfix.clearfix;

        white-space: nowrap;

        .constraint-row-left {
            float: left;
        }
        .constraint-row-right {
            margin-left: 0.5em;
            float: right;

            .constraint-iconbutton {
                margin-left: 0.5em;
                display: inline-block;
            }
        }
    }
</style>
