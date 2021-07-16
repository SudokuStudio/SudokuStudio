export interface InputHandler {
    load(): void,
    unload(): void,

    blur(event: FocusEvent): void,

    keydown(event: KeyboardEvent): void;
    keyup(event: KeyboardEvent): void;
    padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void;

    down(event: MouseEvent): void;
    move(event: MouseEvent): void;
    up(event: MouseEvent): void;
    leave(event: MouseEvent): void;
    click(event: MouseEvent): void;
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
