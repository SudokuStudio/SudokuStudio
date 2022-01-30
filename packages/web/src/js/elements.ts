import Fuse from 'fuse.js';

import type { ElementInfo } from "./element/element";

import { centerInfo, colorsInfo, cornerInfo, filledInfo, givensInfo } from "./element/digit";
import { betweenInfo, palindromeInfo, renbanInfo, slowThermoInfo, thermoInfo, whisperInfo } from "./element/lines";
import { consecutiveInfo, disjointGroupsInfo, diagonalInfo, knightInfo, kingInfo, selfTaxicabInfo } from "./element/toggles";
import { evenInfo, maxInfo, minInfo, oddInfo } from "./element/region";
import { quadrupleInfo } from "./element/quadruple";
import { differenceInfo, ratioInfo, xvInfo, sandwichInfo, skyscraperInfo, xsumInfo, littleKillerInfo } from "./element/positionNumbers";
import type { schema } from "@sudoku-studio/schema";
import { boxInfo, gridInfo } from "./element/basic";
import { arrowInfo } from "./element/arrow";
import { killerInfo } from "./element/killer";
import { cloneInfo } from "./element/clone";

export const ELEMENT_HANDLERS = {
    ['givens']: givensInfo,
    ['filled']: filledInfo,
    ['center']: centerInfo,
    ['corner']: cornerInfo,
    ['colors']: colorsInfo,

    ['grid']: gridInfo,
    ['box']: boxInfo,

    ['thermo']: thermoInfo,
    ['slowThermo']: slowThermoInfo,
    ['between']: betweenInfo,
    ['palindrome']: palindromeInfo,
    ['whisper']: whisperInfo,
    ['renban']: renbanInfo,
    ['arrow']: arrowInfo,

    ['min']: minInfo,
    ['max']: maxInfo,
    ['odd']: oddInfo,
    ['even']: evenInfo,

    ['quadruple']: quadrupleInfo,
    ['killer']: killerInfo,
    ['clone']: cloneInfo,

    ['difference']: differenceInfo,
    ['ratio']: ratioInfo,
    ['xv']: xvInfo,

    ['littleKiller']: littleKillerInfo,
    ['sandwich']: sandwichInfo,
    ['skyscraper']: skyscraperInfo,
    ['xsum']: xsumInfo,

    ['diagonal']: diagonalInfo,
    ['knight']: knightInfo,
    ['king']: kingInfo,
    ['disjointGroups']: disjointGroupsInfo,
    ['consecutive']: consecutiveInfo,
    ['selfTaxicab']: selfTaxicabInfo,
} as Record<schema.ElementType, ElementInfo>;

export function createElement<E extends schema.Element>(type: E['type'], value?: E['value']): E {
    if (!(type in ELEMENT_HANDLERS)) throw Error(`Cannot add unknown element type: ${type}.`);
    const handler = ELEMENT_HANDLERS[type];
    if (null == handler) throw Error(`Cannot add unimplmeneted element type: ${type}.`);

    return {
        type,
        order: handler.order,
        value: value,
    } as E;
}

function getSearchableElements(filterFunction: (key: string, info: ElementInfo) => boolean) {
    return Object.entries(ELEMENT_HANDLERS)
        .filter(([ key, info ]) => null != info.menu && filterFunction(key, info))
        .map(([ key, info ]) => ({ key, info }));
}

function buildElementsFuse(searchableElements: { key: string, info: ElementInfo }[]) {
    return new Fuse(searchableElements, {
        keys: [
            {
                name: 'key',
                weight: 0.2,
            },
            {
                name: 'info.menu.name',
                weight: 1.0,
            },
            {
                name: 'info.meta.description',
                weight: 0.8,
            },
            {
                name: 'info.meta.tags',
                weight: 0.8,
            },
            {
                name: 'info.meta.category',
                weight: 0.1,
            },
        ],
        ignoreLocation: true,
        includeScore: true,
    });
}

export function search(fuzzyPattern: string, filterFunction: (key: string, info: ElementInfo) => boolean) {
    const searchableElements = getSearchableElements(filterFunction);

    if (!fuzzyPattern) {
        // If no search text, show all constraints
        return searchableElements.map((item, refIndex) => ({
            item,
            score: 1,
            refIndex,
        }));
    }
    return buildElementsFuse(searchableElements).search(fuzzyPattern);
}
