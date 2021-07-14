import type { Grid, Coord, Geometry, IdxBitset, Idx } from "@sudoku-studio/schema";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord, bitsetToList, distSq, cellLine, isOnGrid } from "@sudoku-studio/board-utils";
import { filledState, thermoState_TEMP } from "./board";
import { userSelectState } from "./user";
import type { StateRef } from "../../../state-manager/lib/state-manager";

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


export interface PointerHandler {
    down(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void;
    move(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void;
    up(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void;
    leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void;
    click(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void;
}

type CellDragStartEndEvent = {
    event: MouseEvent,
};
type CellDragTapEvent = {
    event: MouseEvent,
    coord: Coord<Geometry.CELL>,
    grid: Grid,
    svg: SVGSVGElement,
};

class AdjacentCellPointerHandler extends EventTarget implements PointerHandler {
    private readonly _interpolateOnReender: boolean;

    private _prevPos: Coord<Geometry.SVG> | null = null;
    private _prevCell: Idx<Geometry.CELL> | null = null;
    private _isDown = false;
    private _isTap: boolean = false;

    constructor(interpolateOnReenter: boolean) {
        super();
        this._interpolateOnReender = interpolateOnReenter;
    }

    down(event: MouseEvent, _grid: Grid, _svg: SVGSVGElement): void {
        this._dispatch<CellDragStartEndEvent>('dragStart', { event });
        this._isDown = true;
        this._isTap = true;
    }

    move(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        if (this._isDown) {
            this._handle(event, grid, svg);
        }
    }

    up(event: MouseEvent, _grid: Grid, _svg: SVGSVGElement): void {
        if (this._isDown) {
            this._dispatch<CellDragStartEndEvent>('dragEnd', { event });
            this._prevPos = null;
            this._prevCell = null;
            this._isDown = false;
        }
    }

    leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        if (this._isDown)
            this._handle(event, grid, svg);
    }

    // For special single-selected-cell deselect click.
    click(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        if (this._isTap) {
            const coord = svgCoord2cellCoord(click2svgCoord(event, svg), grid, false);
            if (null != coord) {
                this._dispatch<CellDragTapEvent>('tap', { event, coord, grid, svg });
            }
        }
    }

    private _dispatch<T>(name: string, detail: T) {
        this.dispatchEvent(new CustomEvent<T>(name, { detail }));
    }

    private _handle(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {

        const pos = click2svgCoord(event, svg);

        // Interpolate if mouse jumped cells within the board.
        if (null != this._prevPos && 1 < distSq(this._prevPos, pos)) {
            for (const coord of cellLine(this._prevPos, pos, grid)) {
                this._dispatch<CellDragTapEvent>('drag', { event, coord, grid, svg });
                this._prevCell = cellCoord2CellIdx(coord, grid);
            }
            this._prevPos = (this._interpolateOnReender || isOnGrid(pos, grid)) ? pos : null;
            this._isTap = false; // Cancel tap (jumped cells).
        }
        // Otherwise select the current cell.
        else {
            const isFirstClick = null == this._prevPos;
            const coord = svgCoord2cellCoord(pos, grid, !isFirstClick);
            if (null != coord) {
                if (this._prevCell !== cellCoord2CellIdx(coord, grid)) {
                    if (null != this._prevCell)
                        this._isTap = false; // Cancel tap as soon as moved one cell.

                    this._dispatch<CellDragTapEvent>('drag', { event, coord, grid, svg });
                    this._prevCell = cellCoord2CellIdx(coord, grid);
                }
                this._prevPos = pos;
            }
            // Otherwise otherwise reset prevPos if pointer's off the grid.
            else if (!(this._interpolateOnReender || isOnGrid(pos, grid))) {
                this._prevCell = null;
                this._prevPos = null;
                this._isTap = false; // Cancel tap -- off grid.
            }
        }
    }
}



export const thermoPointerHandler = (() => {
    const mouseHandler = new AdjacentCellPointerHandler(true);

    let thermoRef: null | StateRef = null;
    let len = 0;

    mouseHandler.addEventListener('dragStart', ((event: CustomEvent<CellDragStartEndEvent>) => {
        len = 0;
        thermoRef = thermoState_TEMP.ref(`${Date.now()}_${Math.random()}`);
    }) as EventListener);

    mouseHandler.addEventListener('drag', ((event: CustomEvent<CellDragTapEvent>) => {
        if (null == thermoRef) throw 'UNREACHABLE';

        const { coord, grid } = event.detail;
        const idx = cellCoord2CellIdx(coord, grid);

        for (const [ i, oldIdx ] of Object.entries(thermoRef.get<Record<string, number>>() || {})) {
            if (idx === oldIdx) {
                len = +i + 1;
                thermoRef.replace(Array.from({ ...(thermoRef.get<Record<string, number>>() || {}), length: len }));
                return;
            }
        }

        thermoRef.ref(`${len}`).replace(idx);
        len++;
    }) as EventListener);

    mouseHandler.addEventListener('dragEnd', ((event: CustomEvent<CellDragStartEndEvent>) => {
        if (1 >= len) {
            thermoRef!.replace(null);
        }
    }) as EventListener);

    mouseHandler.addEventListener('tap', ((event: CustomEvent<CellDragTapEvent>) => {
        const { coord, grid } = event.detail;
        const idx = cellCoord2CellIdx(coord, grid);

        for (const [ thermoId, thermoVals ] of Object.entries(thermoState_TEMP.get<Record<string, Record<string, number>>>() || {})) {
            if (idx === thermoVals[0]) {
                thermoState_TEMP.ref(`${thermoId}`).replace(null);
                return;
            }
        }

    }) as EventListener)

    return mouseHandler;
})();



export const pointerHandler = (() => {
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

    const mouseHandler = new AdjacentCellPointerHandler(false);

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

    mouseHandler.addEventListener('dragStart', ((event: CustomEvent<CellDragStartEndEvent>) => {
        mode = getMode(event.detail.event);
    }) as EventListener);

    mouseHandler.addEventListener('drag', ((event: CustomEvent<CellDragTapEvent>) => {
        handle(event, false);
    }) as EventListener);

    mouseHandler.addEventListener('tap', ((event: CustomEvent<CellDragTapEvent>) => {
        handle(event, true);
    }) as EventListener)

    return mouseHandler;
})();
