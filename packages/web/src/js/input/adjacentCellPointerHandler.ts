import type { Grid, Coord, Geometry, Idx } from "@sudoku-studio/schema";
import { click2svgCoord, cellCoord2CellIdx, svgCoord2cellCoord, distSq, cellLine, isOnGrid } from "@sudoku-studio/board-utils";
import { getTouchPosition } from "./inputHandler";

export type CellDragTapEvent = {
    event: MouseEvent | TouchEvent,
    coord: Coord<Geometry.CELL>,
    grid: Grid,
};

export class AdjacentCellPointerHandler {
    onTap: null | ((event: CellDragTapEvent) => void) = null;
    onDoubleTap: null | ((event: CellDragTapEvent) => void) = null;
    onDrag: null | ((event: CellDragTapEvent) => void) = null;
    onDragStart: null | ((event: CellDragTapEvent) => void) = null;
    onDragEnd: null | (() => void) = null;

    private readonly _interpolateOnReender: boolean;

    private _prevPos: Coord<Geometry.SVG> | null = null;
    private _prevCell: Idx<Geometry.CELL> | null = null;
    private _isDown = false;
    private _isTap: boolean = false;

    private _lastTapTime: number = 0;
    private _tapCount: number = 0;
    private _lastTapPosition: Coord<typeof Geometry.SVG> | null = null;

    constructor(interpolateOnReenter: boolean) {
        this._interpolateOnReender = interpolateOnReenter;
    }

    mouseDown(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        this._handleDown(event, event, grid, svg);
    }

    mouseMove(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        this._handleMove(event, event, grid, svg);
    }

    mouseUp(): void {
        this._handleUp();
    }

    touchDown(event: TouchEvent, grid: Grid, svg: SVGSVGElement) {
        const touchPosition = getTouchPosition(event);
        if (null == touchPosition) return;

        this._handleDown(event, touchPosition, grid, svg);
    }

    touchMove(event: TouchEvent, grid: Grid, svg: SVGSVGElement) {
        const touchPosition = getTouchPosition(event);
        if (null == touchPosition) return;

        this._handleMove(event, touchPosition, grid, svg);
    }

    touchUp(event: TouchEvent, grid: Grid, svg: SVGSVGElement) {
        this._handleUp();

        const touchPosition = getTouchPosition(event);
        if (null == touchPosition) return;

        const currentTime = new Date().getTime();
        const svgCoord = click2svgCoord(touchPosition, svg);

        const timeSinceLastTap = currentTime - this._lastTapTime;
        this._lastTapTime = currentTime;

        let distanceFromLastTap = 0;
        if (null != this._lastTapPosition) {
            distanceFromLastTap = distSq(svgCoord, this._lastTapPosition);
        }
        this._lastTapPosition = svgCoord;

        // Increase the current tap count if the last tap happened within 500 ms and is close enough
        if (500 > timeSinceLastTap && 0 < timeSinceLastTap && 0.25 > distanceFromLastTap) {
            this._tapCount += 1;
        } else {
            this._tapCount = 1;
        }

        if (2 === this._tapCount) {
            this._handleDoubleClick(event, svgCoord, grid, svg);
        } else {
            this._handleClick(event, svgCoord, grid, svg);
        }
    }

    leave(event: MouseEvent, grid: Grid, svg: SVGSVGElement): void {
        if (this._isDown) {
            this._handle(event, event, grid, svg);
        }
    }

    click(event: MouseEvent, grid: Grid, svg: SVGSVGElement) {
        const svgCoord = click2svgCoord(event, svg);

        // event.detail represents the number of clicks (i.e. 2 = double click, 3 = triple click, etc.)
        if (2 === event.detail) {
            this._handleDoubleClick(event, svgCoord, grid, svg);
        } else {
            this._handleClick(event, svgCoord, grid, svg);
        }
    }

    private _handleDown(event: MouseEvent | TouchEvent, mousePosition: { offsetX: number, offsetY: number }, grid: Grid, svg: SVGSVGElement): void {
        this._isDown = true;
        this._isTap = true;
        this._handle(event, mousePosition, grid, svg);
    }

    private _handleMove(event: MouseEvent | TouchEvent, mousePosition: { offsetX: number, offsetY: number }, grid: Grid, svg: SVGSVGElement): void {
        if (this._isDown) {
            this._handle(event, mousePosition, grid, svg);
        }
    }

    private _handleUp(): void {
        if (this._isDown) {
            this.onDragEnd && this.onDragEnd();
            this._prevPos = null;
            this._prevCell = null;
            this._isDown = false;
        }
    }

    private _handleClick(event: MouseEvent | TouchEvent, svgCoord: Coord<typeof Geometry.SVG>, grid: Grid, svg: SVGSVGElement): void {
        if (this._isTap) {
            const coord = svgCoord2cellCoord(svgCoord, grid, false);
            if (null != coord) {
                this.onTap && this.onTap({ event, coord, grid });
            }
        }
    }

    private _handleDoubleClick(event: MouseEvent | TouchEvent, svgCoord: Coord<typeof Geometry.SVG>, grid: Grid, svg: SVGSVGElement): void {
        const coord = svgCoord2cellCoord(svgCoord, grid, false);
        if (null != coord) {
            this.onDoubleTap && this.onDoubleTap({ event, coord, grid });
        }
    }

    private _handle(event: MouseEvent | TouchEvent, mousePosition: { offsetX: number, offsetY: number }, grid: Grid, svg: SVGSVGElement): void {
        const pos = click2svgCoord(mousePosition, svg);

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
