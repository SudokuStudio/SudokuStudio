import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";
import { StateManager } from '@sudoku-studio/state-manager';
import { getDigits as getDigitsHelper } from '@sudoku-studio/board-utils';
import { writable } from "svelte/store";

export const boardSvg = writable<SVGSVGElement>();
export const boardDiv = writable<HTMLDivElement>();

export const boardState = (window as any).boardState = new StateManager();
export const boardGridRef = boardState.ref('grid');

export function getDigits(includeGivens: boolean = true, includeFilled: boolean = true): IdxMap<Geometry.CELL, number> {
    return getDigitsHelper(boardState.get<schema.Board['elements']>('elements') || {}, includeGivens, includeFilled);
}

export const warningState = (window as any).warningState = new StateManager();
