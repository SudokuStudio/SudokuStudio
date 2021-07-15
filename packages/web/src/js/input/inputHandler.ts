export interface InputHandler {
    load(): void,
    unload(): void,

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
const KEYCODES = {
    Delete: null,
    Backspace: null,
    NumpadDecimal: null,
} as const;

export function parseDigit(code: string): undefined | null | number {
    if (code in KEYCODES) {
        return KEYCODES[code as keyof typeof KEYCODES];
    }

    const match = DIGIT_REGEX.exec(code);
    if (match) return Number(match[1]);

    return undefined;
}
