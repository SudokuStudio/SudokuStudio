export * as fPuzzles from './f-puzzles';
export * as binary from './binary';

import * as Base64 from "base64-js";
export function bytesToUrlBase64(bytes: Uint8Array): string {
    return Base64.fromByteArray(bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
export function urlBase64ToBytes(urlB64: string): Uint8Array {
    urlB64 = urlB64.padEnd(4 * Math.ceil(urlB64.length / 4), '=');
    return Base64.toByteArray(urlB64);
}
