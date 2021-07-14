import type { Geometry, IdxBitset } from "@sudoku-studio/schema";
import { bitsetToList } from "@sudoku-studio/board-utils";
import { filledState } from "./board";
import { userSelectState } from "./user";

const DIGIT_REGEX = /^Digit(\d)$/;
const KEYCODES = {
    Delete: null,
    Backspace: null,
} as const;

export const keydown = (event: KeyboardEvent) => {
    // Null means delete.
    let num: null | undefined | number = undefined;

    if (event.code in KEYCODES) {
        num = KEYCODES[event.code as keyof typeof KEYCODES];
    }
    else {
        const match = DIGIT_REGEX.exec(event.code);
        if (match) num = Number(match[1]);
    }
    if (undefined === num) return;

    // TODO: Use a helper function to handle buttons as well.
    const selection = bitsetToList(userSelectState.get<IdxBitset<Geometry.CELL>>());
    const update: Record<string, number | null> = {};
    for (const cellIdx of selection) {
        update[`${cellIdx}`] = num;
    }
    filledState.update(update);
};
