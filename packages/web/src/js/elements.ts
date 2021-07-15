import { diagonalInfo } from "./element/diagonal";
import type { ElementInfo } from "./element/element";

import { centerInfo, colorsInfo, cornerInfo, filledInfo, givensInfo } from "./element/digit";

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

    ['thermo']: null, //check(ThermoHandler),
    ['diagonal']: check(diagonalInfo),
    ['knight']: null, //check(makeSimpleHandler(true, Knight)),
    ['king']: null, //check(makeSimpleHandler(true, King)),
    ['disjointGroups']: null, //check(makeSimpleHandler(true, DisjointGroups)),
    ['consecutive']: null, //check(makeSimpleHandler(true, Consecutive)),
} as const;
