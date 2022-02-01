import { derived, readable } from "svelte/store";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { ElementInfo } from "./element/element";
import { boardGridRef, boardState, boardSvg, warningState } from "./board";
import type { Geometry, Grid, IdxBitset, schema } from "@sudoku-studio/schema";
import { createElement, ELEMENT_HANDLERS } from "./elements";
import { userPrevToolState, userState, userToolState } from "./user";
import type { InputHandler } from "./input/inputHandler";
import { pushHistory } from "./history";
import { boardRepr, getDigits } from "@sudoku-studio/board-utils";

export type ElementHandlerItem = { id: string, elementRef: StateRef, info: ElementInfo, type: schema.ElementType };
export type ElementHandlerList = ElementHandlerItem[];

export function addElement<E extends schema.Element>(type: E['type'], value?: E['value']): string {
    if (!(type in ELEMENT_HANDLERS)) throw Error(`Cannot add unknown element type: ${type}.`);
    const handler = ELEMENT_HANDLERS[type];

    let elementValue = value;
    if ('checkbox' === handler.menu?.type && null == elementValue) {
        if (!Array.isArray(handler.menu.checkbox)) {
            elementValue = true;
        }
        else {
            const dict: Record<string, boolean> = {};
            for (const { refPath } of handler.menu.checkbox) {
                dict[refPath] = true;
            }
            elementValue = dict;
        }
    }

    const element = createElement(type, elementValue);
    if (null == handler) throw Error(`Cannot add unimplmeneted element type: ${type}.`);

    const id = boardRepr.makeUid();
    const diff = boardState.update({
        [`elements/${id}`]: element,
    });
    pushHistory(diff);

    if ('select' === handler.menu?.type) {
        userToolState.replace(id);
        userPrevToolState.replace(id);
    }

    return id;
}

export function removeElement(id: string): void {
    const diff = boardState.update({
        [`elements/${id}`]: null,
    });
    pushHistory(diff);

    // If deleting the selected tool, switch to filled.
    if (id === userToolState.get()) {
        const newId = userState.get<string>('marks', 'filled');
        userToolState.replace(newId);
        userPrevToolState.replace(newId);
    }
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
                    type,
                });
            }
            else {
                // Change.
                if (oldVal.type !== newVal.type)
                    console.error(`Cannot change type of constraint! ${oldVal.type} -> ${newVal.type}`);
                // Do nothing.
            }
        }
        list.sort((a, b) =>
            (+(b.info.permanent || 0) - +(a.info.permanent || 0))
            || a.info.order - b.info.order);

        set(list);
    }, true);
});

boardState.ref('elements').watch<schema.Board['elements']>((_path, _oldElements, newElements) => {
    if (null == newElements) return;
    const digits = getDigits(newElements);

    const warnings: IdxBitset<Geometry.CELL> = {};
    const grid = boardGridRef.get<Grid>();
    for (const { type, value } of Object.values(newElements)) {
        const handler = ELEMENT_HANDLERS[type];
        if (null == handler || null == handler.getWarnings) continue;

        handler.getWarnings(value, grid, digits, warnings);
    }
    warningState.update({ 'cells': warnings });
}, true);

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
