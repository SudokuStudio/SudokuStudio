import { diagonalInfo } from "./element/diagonal";
import type { ElementInfo } from "./element/element";

import { centerInfo, colorsInfo, cornerInfo, filledInfo, givensInfo } from "./element/digit";
import { thermoInfo } from "./element/thermo";

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

    ['arrow']: null,
    ['sandwich']: null,
    ['min']: null,
    ['max']: null,
    ['killer']: null,
    ['quadruple']: null,

    ['thermo']: check(thermoInfo),
    ['diagonal']: check(diagonalInfo),
    ['knight']: null,
    ['king']: null,
    ['disjointGroups']: null,
    ['consecutive']: null,
} as const;
