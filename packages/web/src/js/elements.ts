import type { ElementHandlerClass } from "./element/element";
import { SelectHandler } from "./element/select";
import { ThermoHandler } from "./element/thermo";

function assertIsElementHandlerClass<T extends ElementHandlerClass<any>>(handler: T): T {
    return handler;
}

export const ELEMENT_HANDLERS = {
    ['filled']: assertIsElementHandlerClass(SelectHandler),
    ['center']: assertIsElementHandlerClass(SelectHandler),
    ['corner']: assertIsElementHandlerClass(SelectHandler),
    ['colors']: assertIsElementHandlerClass(SelectHandler),

    ['grid']: null,
    ['box']: null,

    ['given']: null,
    ['arrow']: null,
    ['sandwich']: null,
    ['min']: null,
    ['max']: null,
    ['killer']: null,
    ['quadruple']: null,

    [ThermoHandler.TYPE]: assertIsElementHandlerClass(ThermoHandler),
    ['diagonal']: null,
    ['knight']: null,
    ['king']: null,
    ['disjointGroups']: null,
    ['consecutive']: null,
} as Record<string, null | ElementHandlerClass<any>>;
