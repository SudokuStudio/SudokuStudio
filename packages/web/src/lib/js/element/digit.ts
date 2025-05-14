import type { schema } from '@sudoku-studio/schema';
import type { ElementInfo } from '@sudoku-studio/elements/src';
import hsluv from 'hsluv';
import { makeSelectDigitGetInputHandler } from './selectDigitInputHandler.js';
import DigitRender from './DigitRender.svelte';
import CornerRender from './CornerRender.svelte';
import CenterRender from './CenterRender.svelte';
import ColorsRender from './ColorsRender.svelte';

export const givensInfo: ElementInfo<schema.DigitElement['value']> = {
    component: DigitRender,
    getInputHandler: makeSelectDigitGetInputHandler({
        multipleDigits: false,
        blockedByGivens: false,
        blockedByFilled: false,
        nextMode: 'corner',
    }),
    order: 220,
    permanent: true,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Given', icon: 'given' },
} as const;

export const filledInfo: ElementInfo<schema.DigitElement['value']> = {
    component: (internals, props) =>
        DigitRender(internals, Object.assign(props, { color: '#4e72b0', mask: 'url(#SUDOKU_MASK_GIVENS)' })),
    getInputHandler: makeSelectDigitGetInputHandler({
        multipleDigits: false,
        blockedByGivens: true,
        blockedByFilled: false,
        nextMode: 'corner',
    }),
    order: 210,
} as const;

export const cornerInfo: ElementInfo<schema.PencilMarksElement['value']> = {
    component: CornerRender,
    getInputHandler: makeSelectDigitGetInputHandler({
        multipleDigits: true,
        blockedByGivens: true,
        blockedByFilled: true,
        nextMode: 'center',
    }),
    order: 200,
} as const;

export const centerInfo: ElementInfo<schema.PencilMarksElement['value']> = {
    component: CenterRender,
    getInputHandler: makeSelectDigitGetInputHandler({
        multipleDigits: true,
        blockedByGivens: true,
        blockedByFilled: true,
        nextMode: 'colors',
    }),
    order: 200,
} as const;

export const colorsList: string[] = [
    '#111111',
    '#666666',
    '#b2b2b2',
    hsluv.hsluvToHex([10, 100, 60]),
    hsluv.hsluvToHex([40, 100, 65]),
    hsluv.hsluvToHex([70, 100, 92]),
    hsluv.hsluvToHex([120, 100, 80]),
    hsluv.hsluvToHex([230, 100, 85]),
    hsluv.hsluvToHex([260, 100, 55]),
    hsluv.hsluvToHex([300, 100, 70]),
];

export const colorsInfo: ElementInfo<schema.ColorsElement['value']> = {
    component: ColorsRender,
    getInputHandler: makeSelectDigitGetInputHandler({
        multipleDigits: true,
        blockedByGivens: false,
        blockedByFilled: false,
        nextMode: 'filled',
        digitMapping: colorsList,
    }),
    order: 10,
} as const;
