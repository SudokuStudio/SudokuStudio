import Fuse from 'fuse.js';

import type { ElementInfo } from '@sudoku-studio/elements-schema';

import * as digit from './element/digit';
import {
    arrow,
    basic,
    clone,
    killer,
    lines,
    positionNumbers,
    quadruple,
    region,
    toggles,
} from '@sudoku-studio/elements-all/src';
import type { schema } from '@sudoku-studio/schema';

export const ELEMENT_HANDLERS = {
    ['givens']: digit.givensInfo,
    ['filled']: digit.filledInfo,
    ['center']: digit.centerInfo,
    ['corner']: digit.cornerInfo,
    ['colors']: digit.colorsInfo,

    ['grid']: basic.gridInfo,
    ['gridRegion']: basic.gridRegionInfo,

    ['thermo']: lines.thermoInfo,
    ['slowThermo']: lines.slowThermoInfo,
    ['between']: lines.betweenInfo,
    ['lockout']: lines.lockoutInfo,
    ['doubleArrow']: lines.doubleArrowInfo,
    ['palindrome']: lines.palindromeInfo,
    ['whisper']: lines.germanWhisperInfo,
    ['dutchWhisper']: lines.dutchWhisperInfo,
    ['renban']: lines.renbanInfo,
    ['regionSum']: lines.regionSumInfo,

    ['min']: region.minInfo,
    ['max']: region.maxInfo,
    ['odd']: region.oddInfo,
    ['even']: region.evenInfo,
    ['columnIndexer']: region.columnIndexerInfo,
    ['rowIndexer']: region.rowIndexerInfo,

    ['arrow']: arrow.arrowInfo,
    ['quadruple']: quadruple.quadrupleInfo,
    ['killer']: killer.killerInfo,
    ['clone']: clone.cloneInfo,

    ['difference']: positionNumbers.differenceInfo,
    ['ratio']: positionNumbers.ratioInfo,
    ['xv']: positionNumbers.xvInfo,
    ['littleKiller']: positionNumbers.littleKillerInfo,
    ['sandwich']: positionNumbers.sandwichInfo,
    ['skyscraper']: positionNumbers.skyscraperInfo,
    ['xsum']: positionNumbers.xsumInfo,

    ['diagonal']: toggles.diagonalInfo,
    ['knight']: toggles.knightInfo,
    ['king']: toggles.kingInfo,
    ['disjointGroups']: toggles.disjointGroupsInfo,
    ['consecutive']: toggles.consecutiveInfo,
    ['antiX']: toggles.antiXInfo,
    ['antiV']: toggles.antiVInfo,
    ['selfTaxicab']: toggles.selfTaxicabInfo,
} as Record<schema.ElementType, ElementInfo<any>>;

export function createElement<E extends schema.Element>(type: E['type'], value?: E['value']): E {
    if (!(type in ELEMENT_HANDLERS)) throw Error(`Cannot add unknown element type: ${type}.`);
    const handler = ELEMENT_HANDLERS[type];
    if (null == handler) throw Error(`Cannot add unimplmeneted element type: ${type}.`);

    return { type, order: handler.order, value: value } as E;
}

function getSearchableElements(filterFunction: (key: string, info: ElementInfo<any>) => boolean) {
    return Object.entries(ELEMENT_HANDLERS)
        .filter(([key, info]) => null != info.menu && filterFunction(key, info))
        .map(([key, info]) => ({ key, info }));
}

function buildElementsFuse(searchableElements: { key: string; info: ElementInfo<any> }[]) {
    return new Fuse(searchableElements, {
        keys: [
            { name: 'info.menu.name', weight: 1 },
            { name: 'info.meta.tags', weight: 1 },
        ],
        ignoreLocation: true,
        threshold: 0.2,
    });
}

export function search(fuzzyPattern: string, filterFunction: (key: string, info: ElementInfo<any>) => boolean) {
    const searchableElements = getSearchableElements(filterFunction);

    if (!fuzzyPattern) {
        // If no search text, show all constraints
        return searchableElements.map((item, refIndex) => ({ item, refIndex }));
    }
    return buildElementsFuse(searchableElements).search(fuzzyPattern);
}
