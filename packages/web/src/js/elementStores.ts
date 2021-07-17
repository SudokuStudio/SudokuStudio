import { derived, readable } from "svelte/store";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { ElementInfo } from "./element/element";
import { boardGridRef, boardState, boardSvg } from "./board";
import type { Grid, schema } from "@sudoku-studio/schema";
import { createElement, ELEMENT_HANDLERS } from "./elements";
import { userToolState } from "./user";
import type { InputHandler } from "./input/inputHandler";
import { pushHistory } from "./history";

export type ElementHandlerItem = { id: string, elementRef: StateRef, info: ElementInfo };
export type ElementHandlerList = ElementHandlerItem[];

export function addElement<E extends schema.Element>(type: E['type'], value?: E['value']): number {
    const element = createElement(type, value);
    if (!(type in ELEMENT_HANDLERS)) throw Error(`Cannot add unknown element type: ${type}.`);
    const handler = ELEMENT_HANDLERS[type];
    if (null == handler) throw Error(`Cannot add unimplmeneted element type: ${type}.`);

    const id = (31 * Math.floor(0xFFFFFFFF * Math.random()) + Date.now()) % 0xFFFFFFFF;
    const diff = boardState.update({
        [`elements/${id}`]: element,
    });
    pushHistory(diff);

    return id;
}

export const elementHandlers = readable<ElementHandlerList>([], set => {
    const list: ElementHandlerList = [];

    boardState.ref('elements/*').watch<schema.Element>(([ _elements, elementId ], oldVal, newVal) => {
        const type = oldVal?.type || newVal!.type;

        const elementInfo = ELEMENT_HANDLERS[type];
        if (null == elementInfo) {
            console.warn(`Unknown constraint type: ${type}.`);
            return;
        }

        let i = -1;
        if (null != oldVal) {
            i = list.findIndex(({ id }) => elementId === id);
            if (0 > i) {
                console.error(`Failed to find constraint with id ${elementId}.`);
                return;
            }
        }

        if (null == newVal) {
            // Deleted.
            list.splice(i, 1);
        }
        else {
            // Add or change.
            if (null == oldVal) {
                const elementRef = boardState.ref(_elements, elementId)

                // Add.
                list.push({
                    id: elementId,
                    elementRef,
                    info: elementInfo,
                });
            }
            else {
                // Change.
                if (oldVal.type !== newVal.type)
                    console.error(`Cannot change type of constraint! ${oldVal.type} -> ${newVal.type}`);
                // Do nothing.
            }
        }
        set(list);
    }, true);
});

export const currentElement = readable<null | ElementHandlerItem>(null, set => {
    let list: ElementHandlerList = [];
    elementHandlers.subscribe(value => list = value);

    userToolState.watch((_path, _oldVal, newVal) => {
        const toolId = newVal;
        const out = list.find(({ id }) => toolId === id) || null;
        // console.log(list, toolId, out);
        set(out);
    }, true);
});

export const currentInputHandler = derived<[ typeof currentElement, typeof boardSvg ], null | InputHandler>(
    [ currentElement, boardSvg ],
    ([ $currentElement, $boardSvg ]) => {
        if (null == $currentElement) return null;
        const { info, elementRef } = $currentElement;
        const valueRef = elementRef.ref('value');
        if (null == info || null == info.getInputHandler) return null;

        const inputHandler = info.getInputHandler(valueRef, boardGridRef.get<Grid>(), $boardSvg);
        inputHandler.load();
        return inputHandler;
    });
