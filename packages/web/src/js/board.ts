import type { Geometry, Idx, IdxMap, schema } from "@sudoku-studio/schema";
import { Data, StateManager } from '@sudoku-studio/state-manager';
import { getDigits as getDigitsHelper } from '@sudoku-studio/board-utils';
import { writable } from "svelte/store";

export const boardSvg = writable<SVGSVGElement>();
export const boardDiv = writable<HTMLDivElement>();

export const boardState = (window as any).boardState = new StateManager();
export const boardGridRef = boardState.ref('grid');

function getElements(): Record<string, schema.Element> | null {
    return boardState.get<schema.Board['elements']>('elements');
}

function getElementKey(elements: Record<string, schema.Element>, markType: string) {
    return Object.keys(elements!).find((elementKey) => markType === elements![elementKey].type);
}

export function getTypeForElementKey(elementKey: string) {
    return getElements()![elementKey].type;
}

export function getDigits(includeGivens: boolean = true, includeFilled: boolean = true): IdxMap<Geometry.CELL, number> {
    return getDigitsHelper(getElements() || {}, includeGivens, includeFilled);
}

export function getCellValue(markType: string, cellIndex: Idx<Geometry.CELL>): Data {
    const elements = getElements();
    const elementKey = getElementKey(elements!, markType);

    if (null == elementKey) {
        return null;
    }

    return boardState.get('elements', elementKey, 'value', `${cellIndex}`);
}

export function setCellValue(markType: string, cellIndex: Idx<Geometry.CELL>, newValue: Data): void {
    const elements = getElements();
    const elementKey = getElementKey(elements!, markType);

    if (null == elementKey) {
        throw Error(`Mark type ${markType} not found for cell ${cellIndex}`);
    }

    const elementRef = boardState.ref('elements', elementKey, 'value', `${cellIndex}`);
    elementRef.replace(newValue);
}

export const warningState = (window as any).warningState = new StateManager();
