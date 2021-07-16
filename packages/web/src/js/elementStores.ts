import { derived, readable } from "svelte/store";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { ElementInfo } from "./element/element";
import { boardGridRef, boardState, boardSvg } from "./board";
import type { Grid, schema } from "@sudoku-studio/schema";
import { ELEMENT_HANDLERS } from "./elements";
import { userToolState } from "./user";
import type { InputHandler } from "./input/inputHandler";

export type ElementHandlerItem = { id: string, valueRef: StateRef, info: ElementInfo };
export type ElementHandlerList = ElementHandlerItem[];

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
            delete list[i!];
        }
        else {
            // Add or change.
            if (null == oldVal) {
                const valueRef = boardState.ref(_elements, elementId, 'value')

                // Add.
                list.push({
                    id: elementId,
                    valueRef,
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
        const { info, valueRef } = $currentElement;
        if (null == info || null == info.getInputHandler) return null;

        const inputHandler = info.getInputHandler(valueRef, boardGridRef.get<Grid>(), $boardSvg);
        inputHandler.load();
        return inputHandler;
    });
