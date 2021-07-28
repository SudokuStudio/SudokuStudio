export function makeA1Column(x: number) {
    x++;

    const out: string[] = [];
    while (0 < x) {
        x--;
        const mod = x % 26;
        x = Math.floor(x / 26);
        out.unshift(String.fromCharCode(65 + mod));
    }
    return out.join('');
}
