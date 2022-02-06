export interface InputHandler {
    load(): void,
    unload(): void,

    blur(event: FocusEvent): void,

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

const DIGIT_REGEX = /^(?:Digit|Numpad)?(\d)$/;
const NULL_KEYCODES = {
    Delete: null,
    Backspace: null,
    NumpadDecimal: null,
} as const;

export function parseDigit(code: string): undefined | null | number {
    if (code in NULL_KEYCODES) {
        return NULL_KEYCODES[code as keyof typeof NULL_KEYCODES];
    }

    const match = DIGIT_REGEX.exec(code);
    if (match) return Number(match[1]);

    return undefined;
}

export function getTouchPosition(event: TouchEvent) {
    const eventTarget = event.target;

    if (eventTarget instanceof Element) {
        const boundingRect = eventTarget.getBoundingClientRect();
        const firstTouch = event.changedTouches[0];

        if (null != firstTouch) {
            return {
                offsetX: firstTouch.pageX - boundingRect.left,
                offsetY: firstTouch.pageY - boundingRect.top,
            };
        }
    }

    return null;
}