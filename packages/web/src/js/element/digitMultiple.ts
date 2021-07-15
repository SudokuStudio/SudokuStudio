import type { StateRef } from "@sudoku-studio/state-manager";
import type  { ElementHandler } from "./element";
import { DigitHandler } from "./digit";

export class DigitMultipleHandler extends DigitHandler implements ElementHandler {
    constructor(_ref: StateRef) {
        super(_ref, true);
    }
}
