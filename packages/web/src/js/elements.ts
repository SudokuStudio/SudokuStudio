import type { ElementInfo } from "./element/element";

import { centerInfo, colorsInfo, cornerInfo, filledInfo, givensInfo } from "./element/digit";
import { betweenInfo, thermoInfo } from "./element/lines";
import { consecutiveInfo, disjointGroupsInfo, diagonalInfo, knightInfo, kingInfo } from "./element/toggles";
import { maxInfo, minInfo } from "./element/minMax";
import { quadrupleInfo } from "./element/quadruple";

function check<T extends ElementInfo>(factory: T): ElementInfo {
    return factory;
}

export const ELEMENT_HANDLERS = {
    ['givens']: check(givensInfo),
    ['filled']: check(filledInfo),
    ['center']: check(centerInfo),
    ['corner']: check(cornerInfo),
    ['colors']: check(colorsInfo),

    ['grid']: null,
    ['box']: null,

    ['thermo']: check(thermoInfo),
    ['between']: check(betweenInfo),
    ['diagonal']: check(diagonalInfo),
    ['arrow']: null,
    ['sandwich']: null,
    ['min']: check(minInfo),
    ['max']: check(maxInfo),
    ['killer']: null,
    ['quadruple']: check(quadrupleInfo),

    ['knight']: check(knightInfo),
    ['king']: check(kingInfo),
    ['disjointGroups']: check(disjointGroupsInfo),
    ['consecutive']: check(consecutiveInfo),
} as const;
