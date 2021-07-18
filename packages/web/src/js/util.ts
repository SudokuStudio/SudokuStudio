export function makeUid(): string {
    return `${(31 * Math.floor(0xFFFFFFFF * Math.random()) + Date.now()) % 0xFFFFFFFF}`;
}
