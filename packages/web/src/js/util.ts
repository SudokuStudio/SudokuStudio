
export function objectFromEntries(entries: [ string | number, unknown ][]): object {
    const obj: any = Object.create(null);
    for (const [ key, val ] of entries) {
        obj[key] = val;
    }
    return obj;
}