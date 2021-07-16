const objectFromEntries = 'function' === typeof (Object as any).fromEntries
    ? (Object as any).fromEntries
    : ((entries: [ string | number, unknown ][]): object => {
        const obj: any = Object.create(null);
        for (const [ key, val ] of entries) {
            obj[key] = val;
        }
        return obj;
    });

export type Data = null | undefined | string | number | boolean | object;
export type Update = Record<string, Data>;
export type Diff = { redo: Update, undo: Update };

export interface Watcher<T extends Data> {
    (path: string[], oldVal: NonNullable<T>, newVal: null): void;
    (path: string[], oldVal: null, newVal: NonNullable<T>): void;
    (path: string[], oldVal: NonNullable<T>, newVal: NonNullable<T>): void;
}

const WatchersKey = Symbol('watchers key');
type WatcherTree = {
    [WatchersKey]?: Set<Watcher<any>>,
    [K: string]: WatcherTree,
}

type UpdateInternal = {
    data: Data,
    redo: [ string, Data ][],
    undo: [ string, Data ][],
};

/// Same as Object.is except that null and undefined are considered equal.
function isEq(a: unknown, b: unknown): boolean {
    return (null == a && null == b) || Object.is(a, b);
}
/// Converts undefined to null, otherwise identity.
function undefToNull<T>(val: T): null | NonNullable<T> | null {
    if (null == val) return null;
    return val!;
}

export class StateRef {
    private readonly _stateManager: StateManager;
    private readonly _path: string[] = [];

    constructor(stateManager: StateManager, path: string[]) {
        this._stateManager = stateManager;
        for (const seg of path) {
            if ('..' === seg) this._path.pop();
            else if ('.' === seg) {}
            else this._path.push(seg);
        }
    }

    path(): string[] {
        return [ ...this._path ];
    }

    ref(...path: string[]): StateRef {
        return new StateRef(this._stateManager, [ ...this._path, ...path ]);
    }

    get<T extends Data>(): null | T {
        return this._stateManager.get(...this._path);
    }

    watch<T extends Data>(watcher: Watcher<T>, triggerNow: boolean): Watcher<T> {
        this._stateManager.watch(watcher, triggerNow, this._path.join('/'));
        return watcher;
    }

    unwatch<T extends Data>(watcher: Watcher<T>) {
        this._stateManager.unwatch(watcher);
    }

    replace(newData: Data): null | Diff {
        return this._stateManager.update({
            [this._path.join('/')]: newData,
        });
    }

    update(update: Update): null | Diff {
        const path = this._path.join('/') + '/';
        const rootUpdate = objectFromEntries(Object.entries(update)
            .map(([ k, v ]) => [ path + k, v]));
        return this._stateManager.update(rootUpdate);
    }

    // https://svelte.dev/docs#Store_contract
    subscribe(subscription: (value: any) => void): () => void {
        const watch = this.watch((_path, _oldData, newData) => (subscription)(newData), true);
        return () => this.unwatch(watch);
    }
    set(value: any) {
        this.replace(value);
    }
}

/// StateManager provides an interface for updating and reacting to changes in data.
/// Each instance stores a single JS object. Watchers can be assigned to react to changes
/// in specified paths of the object. When updates are given to the StateManager, it will
/// apply the changes and ensure all relevant watchers are called, and it will return a
/// undo/redo diff to the caller.
///
/// This is where the magic happens.
export class StateManager {
    /// The data contained in and managed by this StateManager.
    private _data: Data = null;

    /// Map from each watcher to the paths it's watching.
    private readonly _watchers: Map<Watcher<any>, Set<string>> = new Map();
    private readonly _watcherTreeRoot: WatcherTree = Object.create(null);

    constructor() {}

    ref(...path: string[]): StateRef {
        return new StateRef(this, path);
    }

    get<T extends Data>(...path: string[]): T | null {
        let target = this._data;
        for (const seg of path) {
            if (null == target) break;
            if (seg.includes('/')) throw Error('Path cannot contain "/", split into varargs.');
            target = (target as any)[seg];
        }
        return undefToNull(target) as unknown as T | null;
    }

    watch<T extends Data>(watcher: Watcher<T>, triggerNow: boolean, ...patterns: [ string, ...string[] ]): Watcher<T> {
        let patternSet = this._watchers.get(watcher);
        if (null == patternSet) {
            patternSet = new Set();
            this._watchers.set(watcher, patternSet);
        }

        for (const pattern of patterns) {
            this._watchPattern(watcher, triggerNow, pattern);
        }
        return watcher;
    }

    unwatch<T extends Data>(watcher: Watcher<T>): void {
        if (!this._watchers.has(watcher)) throw Error('Cannot find watcher.');

        const patterns = this._watchers.get(watcher)!;
        this._watchers.delete(watcher);

        for (const pattern of patterns) {
            if (!StateManager._unwatchPattern(watcher, this._watcherTreeRoot, pattern.split('/')))
                throw Error(`Failed to remove watcher from pattern: ${pattern}.`);
        }
    }

    update(update: Update): null | Diff {
        if ('object' !== typeof update) throw Error(`Invalid update object: ${update}`);

        let changed = false;
        const redo: [ string, Data ][] = [];
        const undo: [ string, Data ][] = [];
        for (const [ key, data ] of Object.entries(update)) {
            if (0 >= key.length) throw Error(`Update key cannot be empty.`);
            const segs = key.split('/');
            const { data: newData, redo: newRedo, undo: newUndo } =
                StateManager._updateInternal(this._data, data, segs, [], [ this._watcherTreeRoot ]);

            if (!isEq(this._data, newData)) {
                changed = true;

                this._data = newData;
                redo.push(...newRedo);
                undo.push(...newUndo);
            }
        }
        if (changed) {
            return {
                redo: objectFromEntries(redo) as Update,
                undo: objectFromEntries(undo) as Update,
            }
        }
        return null;
    }

    private _watchPattern(watcher: Watcher<any>, triggerNow: boolean, pattern: string): void {
        if (!pattern || 0 >= pattern.length) {
            throw Error(`Pattern cannot be empty: ${pattern}.`);
        }
        const segs = pattern.split('/');
        let watcherTree = this._watcherTreeRoot;
        for (const seg of segs) {
            if ('.' === seg) continue;
            if (!Object.prototype.hasOwnProperty.call(watcherTree, seg)) {
                watcherTree[seg] = Object.create(null);
            }
            watcherTree = watcherTree[seg];
        }
        (watcherTree[WatchersKey] || (watcherTree[WatchersKey] = new Set())).add(watcher);

        if (triggerNow) {
            StateManager._triggerNow(this._data, segs, [], watcher);
        }
    }

    private static _unwatchPattern(watcher: Watcher<any>, watcherTree: WatcherTree, segs: string[]): boolean {
        if (0 === segs.length) {
            const watchers = watcherTree[WatchersKey];
            if (null == watchers)
                return false;
            if (!watchers.delete(watcher))
                return false;

            if (0 >= watchers.size)
                delete watcherTree[WatchersKey];
            return true;
        }

        const [ seg, ...restSegs ] = segs;
        if ('.' === seg && !this._unwatchPattern(watcher, watcherTree, restSegs))
            return false;
        if (!Object.prototype.hasOwnProperty.call(watcherTree, seg))
            return false;
        if (!this._unwatchPattern(watcher, watcherTree[seg], restSegs))
            return false;

        if (0 >= Object.keys(watcherTree[seg]).length && (null == watcherTree[WatchersKey]))
            delete watcherTree[seg];
        return true;
    }

    /// Triggers a newly added watcher.
    private static _triggerNow(data: Data, segs: string[], path: string[], watcher: Watcher<any>): void {
        if (null == data) return;
        if (0 >= segs.length) {
            // Base case - call watcher.
            try {
                (watcher)(path, null, data);
            }
            catch (e) {
                console.error('Watcher threw:', e, watcher);
            }
            return;
        }
        if ('object' !== typeof data) return; // If segs is not empty we can ignore primitives.

        // Recurse.
        const [ seg, ...restSegs ] = segs;
        if ('.' === seg) {
            this._triggerNow(data, restSegs, path, watcher);
        }
        else if ('*' === seg) {
            for (const [ k, v ] of Object.entries(data)) {
                this._triggerNow(v, restSegs, [ ...path, k ], watcher);
            }
        }
        else if (Object.prototype.hasOwnProperty.call(data, seg)) {
            this._triggerNow((data as any)[seg], restSegs, [ ...path, seg ], watcher);
        }
    }

    /// DATA - Current data we're looking at, traversed recursively. This will NOT be modified.
    /// UPDATE - New data used to update DATA. I.e. when SEGS is empty we return UPDATE. Portions of
    ///     this object (if it is an object) may/will be incorporated into the returned object so be
    ///     careful of side-effects (TODO?).
    /// SEGS - Remaining target segments for the update.
    /// PATH - Path of DATA relative to the root.
    /// WATCHER_TREES - WatcherTrees encountered at the current level, containing watchers for this DATA.
    /// DIFF - A Diff object in which the changes this update makes are written into. This will contain
    ///     pieces of DATA and UPDATE so be careful of side effects (TODO?).
    /// Returns - The replacement value for DATA, or DATA itself if no updates occured.
    ///
    /// Diff logic:
    /// 3 cases we care about:
    /// - Delete: First depth where data gets replaced with null.
    /// - Create: First depth where null gets replaced with update.
    /// - Replace: First depth where data gets replaced with update.
    /// Only trigger this at update-point level.
    private static _updateInternal(data: Data, update: Data, segs: string[], path: string[], watcherTrees: WatcherTree[]): UpdateInternal {
        const atUpdateDepth = 0 >= segs.length;

        // These will be an object or null, so primtives are coerced to null.
        // This prevents trying to e.g. iterate strings as character array objects.
        const dataObj = 'object' === typeof data ? data : null;
        const updateObj = 'object' === typeof update ? update : null;

        const { data: newData, redo, undo } = ((): UpdateInternal => {
            if (atUpdateDepth) {
                // At an update point!
                if (null == dataObj && null == updateObj) {
                    // We've reached a pair of primitives, this is the base case.
                    return { data: update, undo: [], redo: [] }; // May be the same as data, or maybe not.
                }
                // Trigger update on every child key, not just one SEG.
                const allKeys = new Set([
                    ...Object.keys(dataObj || {}),
                    ...Object.keys(updateObj || {}),
                ]);
                // Stores the changes (if any).
                let dataUpdated = false;
                const dataObjNew: Record<string, Data> = Object.create(null);
                const redo = [];
                const undo = [];
                // For child keys.
                for (const key of allKeys) {
                    const innerData = dataObj ? undefToNull((dataObj as any)[key]) : null;
                    const innerUpdate = updateObj ? undefToNull((updateObj as any)[key]) : null;
                    const nextWatcherTrees = StateManager._nextWatcherTrees(key, watcherTrees);
                    // Recurse.
                    const { data: newInnerData, redo: innerRedo, undo: innerUndo } =
                        StateManager._updateInternal(innerData, innerUpdate, [], [ ...path, key ], nextWatcherTrees);

                    if (!isEq(innerData, newInnerData)) {
                        dataUpdated = true;
                        redo.push(...innerRedo);
                        undo.push(...innerUndo);
                        dataObjNew[key] = newInnerData;
                    }
                }
                if (!dataUpdated) {
                    // No changes.
                    return { data, redo, undo };
                }
                // Yes changes.
                const newData = Object.assign(Object.create(null), dataObj);
                for (const [ k, v ] of Object.entries(dataObjNew)) { // Assign, except null deletes keys.
                    { // Handle delete.
                        if (null == v) delete newData[k];
                        else newData[k] = v;
                    }
                }
                // If obj is empty, return null.
                if (0 === Object.keys(newData).length)
                    return { data: null, redo, undo };

                // Otherwise create the object.
                return { data: newData, redo, undo };
            }
            // Not at an update point, just traversing the SEGS.
            const [ key, ...segsRest ] = segs;
            const innerData = dataObj ? undefToNull((dataObj as any)[key]) : null;
            // Do not change UPDATE... we are not at the updating depth yet.
            const nextWatcherTrees = StateManager._nextWatcherTrees(key, watcherTrees);
            // Recurse.
            const { data: newInnerData, redo, undo } = StateManager._updateInternal(innerData, update, segsRest, [ ...path, key ], nextWatcherTrees);
            if (isEq(innerData, newInnerData)) {
                // No changes.
                return { data, redo, undo };
            }
            // Yes changes.
            const newData = Object.assign(Object.create(null), dataObj);
            { // Handle delete.
                if (null == newInnerData) delete newData[key];
                else newData[key] = newInnerData;
            }
            if (Object.values(newData).every(val => null == val)) {
                // All vals null, return null.
                return { data: null, redo, undo };
            }
            return { data: newData, redo, undo };
        })();

        if (!isEq(data, newData)) {
            // if (0 < path.length) {
            //     if (redo && atUpdateDepth) redo[path.join('/')] = newData;
            //     if (undo) undo[path.join('/')] = data;
            // }
            {
                // NULL.
                if (null == data) {
                    // NULL -> NULL.
                    if (null == newData) {
                        throw "N/A";
                    }
                    // NULL -> OBJECT.
                    if ('object' === typeof newData) {
                        // nested.
                    }
                    // NULL -> VALUE.
                    else {
                        redo.length = 0;
                        redo.push([ path.join('/'), newData ]);
                        undo.length = 0;
                        undo.push([ path.join('/'), null ]);
                    }
                }
                // OBJECT.
                else if ('object' === typeof data) {
                    // OBJECT -> NULL.
                    if (null == newData) {
                        // redo.length = 0;
                        // redo.push([ path.join('/'), null ]);
                        // (nested)
                    }
                    // OBJECT -> OBJECT.
                    else if ('object' === typeof newData) {
                        // (both nested)
                    }
                    // OBJECT -> VALUE.
                    else {
                        redo.length = 0;
                        redo.push([ path.join('/'), newData ]);
                        // (nested)
                    }
                }
                // VALUE.
                else {
                    // VALUE -> NULL.
                    if (null == newData) {
                        redo.length = 0;
                        redo.push([ path.join('/'), null ]);
                        undo.length = 0;
                        undo.push([ path.join('/'), data ]);
                    }
                    // VALUE -> OBJECT.
                    else if ('object' === typeof newData) {
                        // (nested)
                        undo.length = 0;
                        undo.push([ path.join('/'), data ]);
                    }
                    // VALUE -> VALUE.
                    else {
                        redo.length = 0;
                        redo.push([ path.join('/'), newData ]);
                        undo.length = 0;
                        undo.push([ path.join('/'), data ]);
                    }
                }
            }
            for (const watcherTree of watcherTrees) {
                for (const watcher of watcherTree[WatchersKey] || []) {
                    try {
                        (watcher)(path, data, newData);
                    }
                    catch (e) {
                        console.error('Watcher threw:', e, watcher);
                    }
                }
            }
            return { data: newData, undo, redo };
        }
        return { data, undo, redo };
    }

    /// Given a list WATCHER_TREES get the next level down of watcher trees, corresponding to KEY.
    private static _nextWatcherTrees(key: string, watcherTrees: WatcherTree[]): WatcherTree[] {
        const nextTrees: WatcherTree[] = [];
        for (const watcherTree of watcherTrees) {
            watcherTree['*'] && nextTrees.push(watcherTree['*']);
            watcherTree[key] && nextTrees.push(watcherTree[key]);
        }
        return nextTrees;
    }
}
