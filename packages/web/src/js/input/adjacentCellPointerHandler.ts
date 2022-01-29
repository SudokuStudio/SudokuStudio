import type { Grid, Coord, Geometry, Idx } from "@sudoku-studio/schema";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord, distSq, cellLine, isOnGrid } from "@sudoku-studio/board-utils";

export type CellDragTapEvent = {
    event: MouseEvent,
    coord: Coord<Geometry.CELL>,
    grid: Grid,
};

export class AdjacentCellPointerHandler {
    onTap: null | ((event: CellDragTapEvent) => void) = null;
    onDrag: null | ((event: CellDragTapEvent) => void) = null;
    onDragStart: null | ((event: CellDragTapEvent) => void) = null;
    onDragEnd: null | (() => void) = null;

    private readonly _interpolateOnReender: boolean;

    private _prevPos: Coord<Geometry.SVG> | null = null;
    private _prevCell: Idx<Geometry.CELL> | null = null;
    private _isDown = false;
    private _isTap: boolean = false;

    constructor(interpolateOnReenter: boolean) {
        this._interpolateOnReender = interpolateOnReenter;
    }

    down(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        this._isDown = true;
        this._isTap = true;
        this._handle(event, grid, svg);
    }

    move(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        if (this._isDown) {
            this._handle(event, grid, svg);
        }
    }

    up(): void {
        if (this._isDown) {
            this.onDragEnd && this.onDragEnd();
            this._prevPos = null;
            this._prevCell = null;
            this._isDown = false;
        }
    }

    leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        if (this._isDown) {
            this._handle(event, grid, svg);
        }
    }

    // For special single-selected-cell deselect click.
    click(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        if (this._isTap) {
            const coord = svgCoord2cellCoord(click2svgCoord(event, svg), grid, false);
            if (null != coord) {
                this.onTap && this.onTap({ event, coord, grid });
            }
        }
    }

    private _handle(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        const pos = click2svgCoord(event, svg);

        // Interpolate if mouse jumped cells within the board.
        if (null != this._prevPos && 1 < distSq(this._prevPos, pos)) {
            for (const coord of cellLine(this._prevPos, pos, grid)) {
                this.onDrag && this.onDrag({ event, coord, grid });
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
                this._prevPos = pos;
                const currentCellIndex = cellCoord2CellIdx(coord, grid);

                if (null != this._prevCell) {
                    // Ignore a drag within the same cell as the previous cell
                    if (this._prevCell === currentCellIndex) {
                        return;
                    }

                    // Cancel any active tap since we have moved between cells
                    this._isTap = false;

                    // Trigger drag event for the cell where the mouse is
                    this.onDrag && this.onDrag({ event, coord, grid });
                } else if (this._isTap) {
                    // Trigger drag start event at start of click
                    this.onDragStart && this.onDragStart({ event, coord, grid });
                }

                // Update previous cell to the cell where the mouse is
                this._prevCell = currentCellIndex;
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
