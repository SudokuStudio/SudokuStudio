import type { Geometry, Idx, IdxMap, schema } from "@sudoku-studio/schema";
import { Data, StateManager } from '@sudoku-studio/state-manager';
import { getDigits as getDigitsHelper } from '@sudoku-studio/board-utils';
import { writable } from "svelte/store";

export const boardSvg = writable<SVGSVGElement>();
export const boardDiv = writable<HTMLDivElement>();

export const boardState = (window as any).boardState = new StateManager();
export const boardGridRef = boardState.ref('grid');

export function getDigits(includeGivens: boolean = true, includeFilled: boolean = true): IdxMap<Geometry.CELL, number> {
    return getDigitsHelper(boardState.get<schema.Board['elements']>('elements') || {}, includeGivens, includeFilled);
}

export function getCellValue(markType: string, cellIndex: Idx<Geometry.CELL>): Data {
    const elements = boardState.get<schema.Board['elements']>('elements');
    const elementKey = Object.keys(elements!).find((elementKey) => markType === elements![elementKey].type);

    if (null == elementKey) {
        return null;
    }

    return boardState.get('elements', elementKey, 'value', `${cellIndex}`);
}

export const warningState = (window as any).warningState = new StateManager();
