import { cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import type { Geometry, Idx, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent, CellDragStartEndEvent } from "../pointerHandler";
import type  { ElementHandler } from "./element";

export class SelectHandler implements ElementHandler {
    static readonly TYPE = 'select';
    static readonly IS_GLOBAL = true;
    static readonly MenuComponent = null;

    readonly pointerHandler = new AdjacentCellPointerHandler(false);

    constructor(ref: StateRef, _menuComponent: null) {
        this._bindPointerhandler(ref);
    }

    getViewBox(_active: boolean): null {
        return null;
    }
    getConflicts(_digits: IdxMap<Geometry.CELL, number>): Idx<Geometry.CELL>[] {
        return [];
    }

    private _bindPointerhandler(userSelectState: StateRef): void {

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
}
