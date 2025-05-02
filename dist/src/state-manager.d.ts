export type Data = null | undefined | string | number | boolean | object;
export type Update = Record<string, Data>;
export type Diff = {
    redo: Update;
    undo: Update;
};
export interface Watcher<T extends Data> {
    (path: string[], oldVal: NonNullable<T>, newVal: null): void;
    (path: string[], oldVal: null, newVal: NonNullable<T>): void;
    (path: string[], oldVal: NonNullable<T>, newVal: NonNullable<T>): void;
}
export declare class StateRef {
    private readonly _stateManager;
    private readonly _path;
    constructor(stateManager: StateManager, path: string[]);
    path(): string[];
    ref(...path: string[]): StateRef;
    get<T extends Data>(): null | T;
    watch<T extends Data>(watcher: Watcher<T>, triggerNow: boolean): Watcher<T>;
    unwatch<T extends Data>(watcher: Watcher<T>): void;
    replace(newData: Data): null | Diff;
    update(update: Update): null | Diff;
    subscribe(subscription: (value: any) => void): () => void;
    set(value: any): void;
}
export declare class StateManager {
    private _data;
    private readonly _watchers;
    private readonly _watcherTreeRoot;
    constructor();
    ref(...path: string[]): StateRef;
    get<T extends Data>(...path: string[]): T | null;
    watch<T extends Data>(watcher: Watcher<T>, triggerNow: boolean, ...patterns: [string, ...string[]]): Watcher<T>;
    unwatch<T extends Data>(watcher: Watcher<T>): void;
    update(update: Update): null | Diff;
    private _watchPattern;
    private static _unwatchPattern;
    private static _triggerNow;
    private static _updateInternal;
    private static _nextWatcherTrees;
}
//# sourceMappingURL=state-manager.d.ts.map