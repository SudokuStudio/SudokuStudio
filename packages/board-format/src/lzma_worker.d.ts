export type Mode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ByteArray = Buffer | Uint8Array | number[];

export function compress(byteArrayOrString: string | ByteArray, mode: Mode,
    onFinish: (result: Buffer | Uint8Array, error: any) => void,
    onProgress?: (percent: number) => void): void;

export function decompress(byteArray: ByteArray,
    onFinish: (result: Buffer | Uint8Array, error: any) => void,
    onProgress?: (percent: number) => void): void;
