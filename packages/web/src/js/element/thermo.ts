import type { Geometry, Idx, ArrayObj, Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import Thermo from "../../svelte/edit/constraint/Thermo.svelte";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { cellCoord2CellIdx, arrayObj2array } from "@sudoku-studio/board-utils";

export const thermoInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menuComponent: Thermo,
};

function getInputHandler(thermoState: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(true);

    let thermoRef: null | StateRef = null;
    let len = 0;

    pointerHandler.onDragStart = (_event: MouseEvent) => {
        len = 0;
        thermoRef = thermoState.ref(`${Date.now()}_${Math.random()}`);
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        if (null == thermoRef) throw 'UNREACHABLE';

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        for (const [ i, oldIdx ] of Object.entries(thermoRef.get<ArrayObj<Idx<Geometry.CELL>>>() || {})) {
            if (idx === oldIdx) {
                len = +i + 1;
                thermoRef.replace(arrayObj2array(thermoRef.get<ArrayObj<Idx<Geometry.CELL>>>() || {}).slice(0, len));
                return;
            }
        }

        thermoRef.ref(`${len}`).replace(idx);
        len++;
    };

    pointerHandler.onDragEnd = () => {
        if (1 >= len) {
            thermoRef!.replace(null);
        }
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        for (const [ thermoId, thermoVals ] of Object.entries(thermoState.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {})) {
            if (idx === thermoVals[0]) {
                thermoState.ref(`${thermoId}`).replace(null);
                return;
            }
        }
    };

    return {
        load(): void {
        },
        unload(): void {
            pointerHandler.up();
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
