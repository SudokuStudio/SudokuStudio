import Given from "../../svelte/edit/constraint/Given.svelte";
import type { StateRef } from "@sudoku-studio/state-manager";
import type  { ElementHandler } from "./element";
import { DigitHandler } from "./digit";

export class GivenHandler extends DigitHandler implements ElementHandler {
    readonly isGlobal = false;
    readonly MenuComponent = Given;

    constructor(_ref: StateRef) {
        super(_ref);
    }
}
