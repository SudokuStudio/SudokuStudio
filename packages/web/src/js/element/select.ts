import type { Geometry, Grid, Idx, IdxBitset, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { bitsetToList, cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import { AdjacentCellPointerHandler, CellDragTapEvent, CellDragStartEndEvent } from "./pointerHandler";
import { userSelectState } from "../user";
import type  { ElementHandler, SvelteComponentConstructor } from "./element";
import { DigitInputEvent, DigitInputHandler } from "./inputHandler";

export class SelectHandler implements ElementHandler {
    readonly isGlobal: boolean = false;
    readonly MenuComponent: null | SvelteComponentConstructor<any, any> = null;
    readonly pointerHandler = new AdjacentCellPointerHandler(false);
    readonly inputHandler = new DigitInputHandler();

    private readonly _stateRef: StateRef;
    constructor(ref: StateRef) {
        this._stateRef = ref;
        this._bindPointerhandler();
        this._bindInputHandler();
    }

    getViewBox(_active: boolean, _grid: Grid): null {
        return null;
    }
    getConflicts(_digits: IdxMap<Geometry.CELL, number>, _grid: Grid, _output: Set<Idx<Geometry.CELL>>): void {
    }

    private _bindPointerhandler(): void {

        enum Mode {
            // Mode when starting a *NEW* selection.
            RESETTING,
            // Mode when we are either selecting or deselecting based on the
            // opposite of the first cell hit.
            DYNAMIC,

            // Mode when user is selecting.
            SELECTING,
            // Mode when user is deselecting.
            DESELCTING,
        }

        // The selecting mode.
        let mode = Mode.RESETTING;

        function getMode(mouseEvent: MouseEvent): Mode {
            if (mouseEvent.shiftKey) {
                // Shift: always select.
                return Mode.SELECTING;
            }
            else if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
                // Ctrl: deselect if clicked cell is selected, otherwise select.
                return Mode.DYNAMIC;
            }
            else if (mouseEvent.altKey) {
                // Alt: always deselect.
                return Mode.DESELCTING;
            }
            else {
                // No modifier: reset and select only this cell.
                return Mode.RESETTING;
            }
        }

        function handle(event: CustomEvent<CellDragTapEvent>, isClick: boolean): void {
            const { coord, grid } = event.detail;
            const idx = cellCoord2CellIdx(coord, grid);

            if (Mode.RESETTING === mode) {
                // Special: Resetting *tap* acts as toggle.
                const select = isClick && userSelectState.get<Record<string, true>>() || {};
                if (isClick && 1 === Object.keys(select).length && select[`${idx}`]) {
                    userSelectState.replace({})
                }
                // Normal:
                else {
                    userSelectState.replace({ [`${idx}`]: true });
                }
                mode = Mode.SELECTING;
                return;
            }

            if (Mode.DYNAMIC === mode) {
                mode = userSelectState.ref(`${idx}`).get() ? Mode.DESELCTING : Mode.SELECTING;
            }
            userSelectState.ref(`${idx}`).replace(Mode.SELECTING === mode || null);
        }

        this.pointerHandler.addEventListener('dragStart', ((event: CustomEvent<CellDragStartEndEvent>) => {
            mode = getMode(event.detail.event);
        }) as EventListener);

        this.pointerHandler.addEventListener('drag', ((event: CustomEvent<CellDragTapEvent>) => {
            handle(event, false);
        }) as EventListener);

        this.pointerHandler.addEventListener('tap', ((event: CustomEvent<CellDragTapEvent>) => {
            handle(event, true);
        }) as EventListener);
    }

    private _bindInputHandler(): void {
        this.inputHandler.addEventListener('digit', ((event: CustomEvent<DigitInputEvent>) => {
            const { digit } = event.detail;
            const update: IdxMap<Geometry.CELL, number | null> = {};
            for (const cellIdx of bitsetToList(userSelectState.get<IdxBitset<Geometry.CELL>>())) {
                update[`${cellIdx}`] = digit;
            }
            this._stateRef.update(update);
        }) as EventListener);
    }
}
