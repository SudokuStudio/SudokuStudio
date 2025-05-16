export interface InputHandler {
    load(): void;
    unload(): void;

    blur(event: FocusEvent): void;

    keydown(event: KeyboardEvent): void;
    keyup(event: KeyboardEvent): void;
    padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void;

    mouseDown(event: MouseEvent): void;
    mouseMove(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
    leave(event: MouseEvent): void;
    click(event: MouseEvent): void;

    touchDown(event: TouchEvent): void;
    touchMove(event: TouchEvent): void;
    touchUp(event: TouchEvent): void;
}

/**
 * Gets the digit represented by the key code for both number keys and numpad.
 * @param code Key code string https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
 * @returns The digit, or `null` for delete keys, or `undefined` if neither a digit nor delete.
 */
export function parseDigit(code: string): undefined | null | number {
    const DIGIT_REGEX = /^(?:Digit|Numpad)?(\d)$/;
    const NULL_KEYCODES = { Delete: null, Backspace: null, NumpadDecimal: null } as const;

    if (code in NULL_KEYCODES) {
        return NULL_KEYCODES[code as keyof typeof NULL_KEYCODES];
    }

    const match = DIGIT_REGEX.exec(code);
    if (match) return Number(match[1]);

    return undefined;
}

/**
 * @param event
 * @returns Screen-space position of the touch event relative to the target element.
 */
export function getTouchPosition(event: TouchEvent): { offsetX: number; offsetY: number } | null {
    const eventTarget = event.target;

    if (eventTarget instanceof Element) {
        const boundingRect = eventTarget.getBoundingClientRect();
        const firstTouch = event.changedTouches[0];

        if (null != firstTouch) {
            return { offsetX: firstTouch.pageX - boundingRect.left, offsetY: firstTouch.pageY - boundingRect.top };
        }
    }

    return null;
}
