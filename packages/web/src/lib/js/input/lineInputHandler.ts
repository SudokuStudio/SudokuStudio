import { arrayObj2array, boardRepr, cellCoord2CellIdx } from '@sudoku-studio/board-utils/src';
import type { Geometry, Idx, schema } from '@sudoku-studio/schema';
import type { Diff, StateRef } from '@sudoku-studio/state-manager/src';
import { AdjacentCellPointerHandler } from './adjacentCellPointerHandler';
import type { CellDragTapEvent } from '../input/adjacentCellPointerHandler';
import type { InputHandler } from './inputHandler';
import type { GetInputHandler, InputHandlerContext } from '../element/element';

export type LineInputHandlerOptions = {
    deletePrioritizeHead: boolean;
    deletePrioritizeTail: boolean;
    allowSelfIntersection: boolean;
};

export function makeLineGetInputHandler(
    options: LineInputHandlerOptions,
): GetInputHandler<schema.LineElement['value']> {
    return (ctx) => getLineInputHandler(ctx, options);
}

function getLineInputHandler(
    ctx: InputHandlerContext<schema.LineElement['value']>,
    options: LineInputHandlerOptions,
): InputHandler {
    const { deletePrioritizeHead, deletePrioritizeTail, allowSelfIntersection } = options;

    const pointerHandler = new AdjacentCellPointerHandler(true);

    let lineRef: null | StateRef<schema.LineElementItem> = null;
    const lineCells: Idx<Geometry.CELL>[] = [];

    function handle(event: CellDragTapEvent) {
        if (null == lineRef) throw 'UNREACHABLE';

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const selfHit = lineCells.indexOf(idx, allowSelfIntersection ? lineCells.length - 2 : 0);
        if (0 <= selfHit) {
            lineCells.length = selfHit + 1;
        } else {
            lineCells.push(idx);
        }

        lineRef.replace(1 < lineCells.length ? lineCells : null);
    }

    pointerHandler.onDragStart = (event: CellDragTapEvent) => {
        lineCells.length = 0;
        lineRef = ctx.stateRef.ref(boardRepr.makeUid());

        handle(event);
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        if (null == lineRef) {
            throw new Error('Line handler, onDragEnd NULL lineRef.');
        }

        if (1 >= lineCells.length) {
            lineRef.replace(null);
        } else {
            const path = lineRef.path().join('/');
            const diff: Diff = { redo: {}, undo: { [path]: null } };
            for (let i = 0; i < lineCells.length; i++) {
                diff.redo[`${path}/${i}`] = lineCells[i];
            }
            ctx.pushHistory(diff);
        }
        lineRef = null;
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        let lineIdToDelete: null | string = null;
        for (const [lineId, lineValArrObj] of Object.entries(ctx.stateRef.get() || {})) {
            const lineValCells = arrayObj2array(lineValArrObj);
            if (deletePrioritizeHead && idx === lineValCells[0]) {
                lineIdToDelete = lineId;
                break;
            }
            if (deletePrioritizeTail && idx === lineValCells[lineValCells.length - 1]) {
                lineIdToDelete = lineId;
                break;
            }
            if (lineValCells.includes(idx)) {
                lineIdToDelete = lineId;
            }
        }
        if (null != lineIdToDelete) {
            ctx.pushHistory(ctx.stateRef.ref(`${lineIdToDelete}`).replace(null));
        }
    };

    return {
        load(): void {
            ctx.clearUserSelection();
        },
        unload(): void {
            pointerHandler.mouseUp();
        },

        blur(_event: FocusEvent): void {},

        keydown(_event: KeyboardEvent): void {},
        keyup(_event: KeyboardEvent): void {},
        padClick(_event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {},

        mouseDown(event: MouseEvent): void {
            pointerHandler.mouseDown(event, ctx.grid, ctx.svg);
        },
        mouseMove(event: MouseEvent): void {
            pointerHandler.mouseMove(event, ctx.grid, ctx.svg);
        },
        mouseUp(_event: MouseEvent): void {
            pointerHandler.mouseUp();
        },
        leave(event: MouseEvent): void {
            pointerHandler.leave(event, ctx.grid, ctx.svg);
        },
        click(event: MouseEvent): void {
            pointerHandler.click(event, ctx.grid, ctx.svg);
        },
        touchDown(event: TouchEvent): void {
            pointerHandler.touchDown(event, ctx.grid, ctx.svg);
        },
        touchMove(event: TouchEvent): void {
            pointerHandler.touchMove(event, ctx.grid, ctx.svg);
        },
        touchUp(event: TouchEvent): void {
            pointerHandler.touchUp(event, ctx.grid, ctx.svg);
        },
    } as const;
}
