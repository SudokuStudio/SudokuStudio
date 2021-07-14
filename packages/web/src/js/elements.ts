import type { ElementHandlerClass } from "./element/element";
import { SelectHandler } from "./element/select";
import { ThermoHandler } from "./element/thermo";

function assertIsElementHandlerClass<T extends ElementHandlerClass<any, any>>(handler: T): T {
    return handler;
}

export const ELEMENT_HANDLERS = {
    [SelectHandler.TYPE]: assertIsElementHandlerClass(SelectHandler),

    [ThermoHandler.TYPE]: assertIsElementHandlerClass(ThermoHandler),
};
