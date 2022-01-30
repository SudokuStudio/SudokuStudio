<script lang="ts">
    import { colorsList } from "../../js/element/digit";
    import { currentInputHandler } from "../../js/elementStores";

    export let digit: number;
    export let gridArea: string;
    export let toolName: string;
</script>

<button
    class={`mdc-ripple-surface padbutton ${toolName}`}
    style={`grid-area: ${gridArea}`}
    value={digit}
    title={`[${digit}]`}
    on:click={$currentInputHandler && $currentInputHandler.padClick || undefined}
>
    <div class="pad-text">{digit}</div>
    <div class="pad-color" style={`background-color: ${colorsList[digit]}`} />
</button>

<style lang="scss">
    @use '../../css/padbutton';
    @use "@material/ripple";

    .padbutton {
        &.center {
            .pad-text {
                font-size: 60%;
            }
        }

        &.corner {
            .pad-text {
                font-size: 60%;
                position: absolute;
                top: 0;
                left: 8%;
            }
        }

        &.colors {
            display: flex;
            justify-content: center;
            align-items: center;

            .pad-text {
                display: none;
            }

            .pad-color {
                width: 70%;
                height: 70%;
            }
        }
    }
</style>