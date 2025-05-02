import type { schema } from "@sudoku-studio/schema";
export declare function makeUid(): string;
export type CreateElementFn = <E extends schema.Element>(type: E["type"], value?: E["value"]) => E;
export declare function createNewBoard(createElement: CreateElementFn, boxWidth?: number, boxHeight?: number): schema.Board;
//# sourceMappingURL=board-repr.d.ts.map