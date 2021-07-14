export interface InputHandler {
    keydown(event: KeyboardEvent): void;
    keyup(event: KeyboardEvent): void;
    padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void;
}

const DIGIT_REGEX = /^(?:Digit)?(\d)$/;
const KEYCODES = {
    Delete: null,
    Backspace: null,
} as const;

export type DigitInputEvent = {
    digit: null | number,
};

export class DigitInputHandler extends EventTarget implements InputHandler {
    keydown(event: KeyboardEvent): void {
        this._handle(event.code);
    }

    keyup(_event: KeyboardEvent): void {

    }

    padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
        const { currentTarget } = event;
        this._handle(currentTarget.value);
    }

    private _handle(code: string) {
        let digit: null | undefined | number = undefined;

        if (code in KEYCODES) {
            digit = KEYCODES[code as keyof typeof KEYCODES];
        }
        else {
            const match = DIGIT_REGEX.exec(code);
            if (match) digit = Number(match[1]);
        }
        if (undefined === digit) return;

        this._dispatch<DigitInputEvent>('digit', { digit });
    }

    private _dispatch<T>(name: string, detail: T) {
        this.dispatchEvent(new CustomEvent<T>(name, { detail }));
    }
}
