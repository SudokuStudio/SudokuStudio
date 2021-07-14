import type { Geometry, Grid, Idx, IdxMap } from "../../../schema/schema";
import type { StateRef } from "../../../state-manager/lib/state-manager";
import { DiagonalHandler } from "./element/diagonal";
import type { ElementHandler, ElementHandlerClass, SvelteComponentConstructor } from "./element/element";

import { GivenHandler } from "./element/given";
import { SelectHandler } from "./element/select";
import { ThermoHandler } from "./element/thermo";

import Knight from "../svelte/edit/constraint/Knight.svelte";
import King from "../svelte/edit/constraint/King.svelte";
import Consecutive from "../svelte/edit/constraint/Consecutive.svelte";
import DisjointGroups from "../svelte/edit/constraint/DisjointGroups.svelte";

function assertIsElementHandlerClass<T extends ElementHandlerClass<any>>(handler: T): T {
    return handler;
}

function makeSimpleHandler(isGlobal: boolean, menuComponent: null | SvelteComponentConstructor<any, any>) {
    return class implements ElementHandler {
        readonly isGlobal: boolean = isGlobal;
        readonly MenuComponent: null | SvelteComponentConstructor<any, any> = menuComponent;
        readonly pointerHandler = null;

        constructor(_ref: StateRef) {
        }

        getViewBox(_active: boolean, _grid: Grid): null {
            return null;
        }
        getConflicts(_digits: IdxMap<Geometry.CELL, number>, _grid: Grid, _output: Set<Idx<Geometry.CELL>>): void {
        }
    }
}

export const ELEMENT_HANDLERS = {
    ['filled']: assertIsElementHandlerClass(SelectHandler),
    ['center']: assertIsElementHandlerClass(SelectHandler),
    ['corner']: assertIsElementHandlerClass(SelectHandler),
    ['colors']: assertIsElementHandlerClass(SelectHandler),

    ['given']: assertIsElementHandlerClass(GivenHandler),

    ['grid']: null,
    ['box']: null,

    ['arrow']: null,
    ['sandwich']: null,
    ['min']: null,
    ['max']: null,
    ['killer']: null,
    ['quadruple']: null,

    [ThermoHandler.TYPE]: assertIsElementHandlerClass(ThermoHandler),
    [DiagonalHandler.TYPE]: assertIsElementHandlerClass(DiagonalHandler),
    ['knight']: assertIsElementHandlerClass(makeSimpleHandler(true, Knight)),
    ['king']: assertIsElementHandlerClass(makeSimpleHandler(true, King)),
    ['disjointGroups']: assertIsElementHandlerClass(makeSimpleHandler(true, DisjointGroups)),
    ['consecutive']: assertIsElementHandlerClass(makeSimpleHandler(true, Consecutive)),
} as Record<string, null | ElementHandlerClass<any>>;
