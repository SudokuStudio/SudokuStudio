import { browser } from '$app/environment';
import type { Geometry, Idx, IdxMap, schema } from '@sudoku-studio/schema';
import type { Data, Diff } from '@sudoku-studio/state-manager/src';
import { StateManager } from '@sudoku-studio/state-manager/src';
import { getDigits as getDigitsHelper } from '@sudoku-studio/board-utils/src';
import { writable } from 'svelte/store';

export const boardSvg = writable<SVGSVGElement>();
export const boardDiv = writable<HTMLDivElement>();

export const boardState = new StateManager();
if (browser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).boardState = boardState;
}

export const boardGridRef = boardState.ref('grid');

function getElements(): Record<string, schema.Element> | null {
    return boardState.get<schema.Board['elements']>('elements');
}

function getElementKey(elements: Record<string, schema.Element>, markType: string): string | undefined {
    return Object.keys(elements!).find((elementKey) => markType === elements![elementKey].type);
}

export function getTypeForElementKey(elementKey: string): schema.ElementType | undefined {
    return getElements()![elementKey]?.type;
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

export function setCellValue(markType: string, cellIndex: Idx<Geometry.CELL>, newValue: Data): Diff | null {
    const elements = getElements();
    const elementKey = getElementKey(elements!, markType);

    if (null == elementKey) {
        throw Error(`Mark type ${markType} not found for cell ${cellIndex}`);
    }

    const elementRef = boardState.ref('elements', elementKey, 'value', `${cellIndex}`);
    return elementRef.replace(newValue);
}

export const warningState = new StateManager();
if (browser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).warningState = warningState;
}
