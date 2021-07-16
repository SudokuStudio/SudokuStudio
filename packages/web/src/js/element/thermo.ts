import type { Geometry, Idx, ArrayObj, Grid } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import Thermo from "../../svelte/edit/constraint/Thermo.svelte";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import { pushHistory } from "../history";
import { userCursorState, userSelectState } from "../user";

export const thermoInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menuComponent: Thermo,
};

function getInputHandler(thermoState: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(true);

    let thermoRef: null | StateRef = null;
    const thermoCells: Idx<Geometry.CELL>[] = [];

    pointerHandler.onDragStart = (_event: MouseEvent) => {
        thermoCells.length = 0;
        thermoRef = thermoState.ref(`${Date.now()}_${Math.random()}`);
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        if (null == thermoRef) throw 'UNREACHABLE';

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const selfHit = thermoCells.indexOf(idx);
        if (0 <= selfHit) {
            thermoCells.length = selfHit + 1;
        }
        else {
            thermoCells.push(idx);
        }
        thermoRef.replace(thermoCells);
    };

    pointerHandler.onDragEnd = () => {
        if (null == thermoRef) {
            throw new Error('Thermo handler, onDragEnd NULL thermoRef.');
        }

        if (1 >= thermoCells.length) {
            thermoRef.replace(null);
        }
        else {
            const path = thermoRef.path().join('/');
            const diff: Diff = {
                redo: {},
                undo: { [path]: null },
            };
            for (let i = 0; i < thermoCells.length; i++) {
                diff.redo[`${path}/${i}`] = thermoCells[i];
            }
            pushHistory(diff);
        }
        thermoRef = null;
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        for (const [ thermoId, thermoVals ] of Object.entries(thermoState.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {})) {
            if (idx === thermoVals[0]) {
                pushHistory(thermoState.ref(`${thermoId}`).replace(null));
                return;
            }
        }
    };

    return {
        load(): void {
            // TODO: not really that great of a way of doing this.
            userSelectState.replace(null);
            userCursorState.replace(null);
        },
        unload(): void {
            pointerHandler.up();
        },

        blur(_event: FocusEvent): void {
        },

        keydown(_event: KeyboardEvent): void {
        },
        keyup(_event: KeyboardEvent): void {
        },
        padClick(_event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
        },

        down(event: MouseEvent): void {
            pointerHandler.down(event);
        },
        move(event: MouseEvent): void {
            pointerHandler.move(event, grid, svg);
        },
        up(_event: MouseEvent): void {
            pointerHandler.up();
        },
        leave(event: MouseEvent): void {
            pointerHandler.leave(event, grid, svg);
        },
        click(event: MouseEvent): void {
            pointerHandler.click(event, grid, svg);
        },
    } as const;
}
