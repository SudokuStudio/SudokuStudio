import type { ElementInfo } from "./element/element";

import { centerInfo, colorsInfo, cornerInfo, filledInfo, givensInfo } from "./element/digit";
import { betweenInfo, palindromeInfo, renbanInfo, thermoInfo, whisperInfo } from "./element/lines";
import { consecutiveInfo, disjointGroupsInfo, diagonalInfo, knightInfo, kingInfo, selfTaxicabInfo } from "./element/toggles";
import { evenInfo, maxInfo, minInfo, oddInfo } from "./element/region";
import { quadrupleInfo } from "./element/quadruple";
import { differenceInfo, ratioInfo, xvInfo, sandwichInfo, skyscraperInfo, xsumsInfo } from "./element/positionNumbers";
import type { schema } from "@sudoku-studio/schema";
import { boxInfo, gridInfo } from "./element/basic";
import { arrowInfo } from "./element/arrow";

export const ELEMENT_HANDLERS = {
    ['givens']: givensInfo,
    ['filled']: filledInfo,
    ['center']: centerInfo,
    ['corner']: cornerInfo,
    ['colors']: colorsInfo,

    ['grid']: gridInfo,
    ['box']: boxInfo,

    ['thermo']: thermoInfo,
    ['between']: betweenInfo,
    ['palindrome']: palindromeInfo,
    ['whisper']: whisperInfo,
    ['renban']: renbanInfo,
    ['arrow']: arrowInfo,

    ['min']: minInfo,
    ['max']: maxInfo,
    ['odd']: oddInfo,
    ['even']: evenInfo,

    ['killer']: null,
    ['quadruple']: quadrupleInfo,
    ['difference']: differenceInfo,
    ['ratio']: ratioInfo,
    ['xv']: xvInfo,

    ['sandwich']: sandwichInfo,
    ['skyscraper']: skyscraperInfo,
    ['xsums']: xsumsInfo,

    ['diagonal']: diagonalInfo,
    ['knight']: knightInfo,
    ['king']: kingInfo,
    ['disjointGroups']: disjointGroupsInfo,
    ['consecutive']: consecutiveInfo,
    ['selfTaxicab']: selfTaxicabInfo,
} as Record<schema.ElementType, null | ElementInfo>;

export function createElement<E extends schema.Element>(type: E['type'], value?: E['value']): E {
    if (!(type in ELEMENT_HANDLERS)) throw Error(`Cannot add unknown element type: ${type}.`);
    const handler = ELEMENT_HANDLERS[type];
    if (null == handler) throw Error(`Cannot add unimplmeneted element type: ${type}.`);

    return {
        type,
        order: handler.order,
        value: value,
    } as E; // Technically the type variance for "E extends schema.Element" is backwards.
}