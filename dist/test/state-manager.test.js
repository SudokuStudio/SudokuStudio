"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_manager_1 = require("../src/state-manager");
const globals_1 = require("@jest/globals");
function loggingWatcher(log) {
    return (path, oldVal, newVal) => log.push({ path, oldVal, newVal });
}
(0, globals_1.describe)("class StateManager", () => {
    (0, globals_1.describe)("update & watch", () => {
        (0, globals_1.it)("basic", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "name");
            stateMgr.update({
                foo: "bar",
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                name: "jake",
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual("jake");
            stateMgr.update({
                name: {
                    jake: 5,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual("jake");
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ jake: 5 });
            stateMgr.update({
                "name/jake": 2,
            });
            (0, globals_1.expect)(log.length).toEqual(3);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ jake: 5 });
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ jake: 2 });
            stateMgr.update({
                name: null,
            });
            (0, globals_1.expect)(log.length).toEqual(4);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ jake: 2 });
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("basic ref", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.ref("name").watch(loggingWatcher(log), true);
            stateMgr.update({
                foo: "bar",
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                name: "jake",
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual("jake");
            stateMgr.update({
                name: {
                    jake: 5,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual("jake");
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ jake: 5 });
            stateMgr.update({
                "name/jake": 2,
            });
            (0, globals_1.expect)(log.length).toEqual(3);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ jake: 5 });
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ jake: 2 });
            stateMgr.update({
                name: null,
            });
            (0, globals_1.expect)(log.length).toEqual(4);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["name"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ jake: 2 });
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("deeply-bubbling-up update", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                "foo/bar/baz/qux": { bag: 5 },
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({
                bar: { baz: { qux: { bag: 5 } } },
            });
            stateMgr.update({
                "foo/bar/baz/qux/zzz/mmo": 5,
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({
                bar: { baz: { qux: { bag: 5 } } },
            });
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({
                bar: { baz: { qux: { bag: 5, zzz: { mmo: 5 } } } },
            });
        });
        (0, globals_1.it)("wildcard", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                people: {
                    jack: {
                        age: 5,
                    },
                },
            });
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "people/*/age");
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["people", "jack", "age"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(5);
            stateMgr.update({
                "people/bill/age": 74,
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["people", "bill", "age"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(74);
            stateMgr.update({
                "people/morty": {
                    age: 14,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(3);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["people", "morty", "age"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(14);
            stateMgr.update({
                people: {
                    suri: {
                        age: 26,
                    },
                },
            });
            (0, globals_1.expect)(log.length).toEqual(7);
            const changes = log.slice(3);
            (0, globals_1.expect)(new Set(changes)).toEqual(new Set([
                { path: ["people", "jack", "age"], oldVal: 5, newVal: null },
                { path: ["people", "bill", "age"], oldVal: 74, newVal: null },
                { path: ["people", "morty", "age"], oldVal: 14, newVal: null },
                { path: ["people", "suri", "age"], oldVal: null, newVal: 26 },
            ]));
        });
        (0, globals_1.it)("handles replacement (select)", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                select: {
                    0: true,
                    1: true,
                    2: true,
                    3: true,
                },
            });
            stateMgr.ref("select", "2").replace(null);
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                select: {
                    0: true,
                    1: true,
                    3: true,
                },
            });
            stateMgr.update({
                select: { 4: true },
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                select: { 4: true },
            });
        });
    });
    (0, globals_1.describe)("delete", () => {
        (0, globals_1.it)("basic delete", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                "foo/bar/baz": 5,
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ bar: { baz: 5 } });
            stateMgr.update({
                foo: null,
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ bar: { baz: 5 } });
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("deeply-cascading delete", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo/bar/baz/qux");
            stateMgr.update({
                "foo/bar/baz/qux": 5,
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo", "bar", "baz", "qux"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(5);
            stateMgr.update({
                foo: null,
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo", "bar", "baz", "qux"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual(5);
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("no-op deletes", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                foo: {
                    bar: 5,
                },
            });
            const log = [];
            stateMgr.watch(loggingWatcher(log), false, "foo");
            stateMgr.update({
                "foo/bar/baz/qux": {},
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                "foo/bar/baz/qux": null,
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                "foo/bar/baz/qux": undefined,
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                "foo/bar/baz/qux": [],
            });
            (0, globals_1.expect)(log.length).toEqual(0);
            stateMgr.update({
                "foo/bar/baz/qux": "",
            });
            (0, globals_1.expect)(log.length).toEqual(1);
        });
    });
    (0, globals_1.describe)("triggerNow", () => {
        (0, globals_1.it)("trigger on existing value", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                foo: "bar",
            });
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual("bar");
        });
        (0, globals_1.it)("ignore empty", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                foo: "bar",
            });
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "baz");
            (0, globals_1.expect)(log.length).toEqual(0);
        });
        (0, globals_1.it)("trigger on existing with wildcard", () => {
            const stateMgr = new state_manager_1.StateManager();
            stateMgr.update({
                ages: {
                    jake: 50,
                    jason: 52,
                    morty: 14,
                    mingwei: 23,
                },
            });
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "ages/*");
            (0, globals_1.expect)(log.length).toEqual(4);
            let foundMorty = false;
            for (const row of log) {
                (0, globals_1.expect)(row.path.length).toBe(2);
                (0, globals_1.expect)(row.path[0]).toBe("ages");
                if ("morty" === row.path[1]) {
                    (0, globals_1.expect)(row.oldVal).toBeNull();
                    (0, globals_1.expect)(row.newVal).toEqual(14);
                    foundMorty = true;
                }
            }
            (0, globals_1.expect)(foundMorty).toBeTruthy();
        });
    });
    (0, globals_1.describe)("edge cases", () => {
        (0, globals_1.it)("replace obj with true", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    foo: {
                        0: "a",
                        1: "b",
                        2: "c",
                    },
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "foo/0": "a",
                        "foo/1": "b",
                        "foo/2": "c",
                    },
                    undo: {
                        "foo/0": null, // Is this desired behavior?
                        "foo/1": null,
                        "foo/2": null,
                    },
                });
                (0, globals_1.expect)(stateMgr.get()).toEqual({
                    foo: {
                        0: "a",
                        1: "b",
                        2: "c",
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    foo: true,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        foo: true,
                    },
                    undo: {
                        "foo/0": "a",
                        "foo/1": "b",
                        "foo/2": "c",
                    },
                });
                (0, globals_1.expect)(stateMgr.get()).toEqual({
                    foo: true,
                });
            }
        });
        (0, globals_1.it)("handle false basic", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                foo: false,
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                foo: false,
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(false);
            stateMgr.update({
                foo: null,
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual(null);
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual(false);
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("handle false nested", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                foo: {
                    bar: false,
                },
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                foo: {
                    bar: false,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ bar: false });
            stateMgr.update({
                foo: null,
            });
            (0, globals_1.expect)(stateMgr.get()).toBeNull();
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({ bar: false });
            (0, globals_1.expect)(log[log.length - 1].newVal).toBeNull();
        });
        (0, globals_1.it)("handle bool object", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                foo: {
                    positive: true,
                    negative: false,
                },
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                foo: {
                    positive: true,
                    negative: false,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({
                positive: true,
                negative: false,
            });
            stateMgr.update({
                foo: {
                    positive: true,
                    negative: true,
                },
            });
            (0, globals_1.expect)(stateMgr.get()).toEqual({
                foo: {
                    positive: true,
                    negative: true,
                },
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual({
                positive: true,
                negative: false,
            });
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({
                positive: true,
                negative: true,
            });
        });
        (0, globals_1.it)("overwrite primitive", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                foo: 5,
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual(5);
            stateMgr.update({
                "foo/bar": 10,
            });
            (0, globals_1.expect)(log.length).toEqual(2);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toEqual(5);
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ bar: 10 });
        });
        (0, globals_1.it)("arrays convert to objects", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            stateMgr.watch(loggingWatcher(log), true, "foo");
            stateMgr.update({
                foo: [5],
            });
            (0, globals_1.expect)(log.length).toEqual(1);
            (0, globals_1.expect)(log[log.length - 1].path).toEqual(["foo"]);
            (0, globals_1.expect)(log[log.length - 1].oldVal).toBeNull();
            (0, globals_1.expect)(log[log.length - 1].newVal).toEqual({ 0: 5 });
        });
        (0, globals_1.it)("cannot watch empty", () => {
            const stateMgr = new state_manager_1.StateManager();
            const log = [];
            (0, globals_1.expect)(() => stateMgr.watch(loggingWatcher(log), true, "")).toThrow();
        });
    });
    (0, globals_1.describe)("diff", () => {
        (0, globals_1.it)("makes diffs for simple values", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    a: 1,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        a: 1,
                    },
                    undo: {
                        a: null,
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    a: 2,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        a: 2,
                    },
                    undo: {
                        a: 1,
                    },
                });
            }
        });
        (0, globals_1.it)("makes diffs nested", () => {
            const stateMgr = new state_manager_1.StateManager();
            let diff;
            diff = stateMgr.update({
                foo: "bar",
            });
            (0, globals_1.expect)(diff).toEqual({
                redo: {
                    foo: "bar",
                },
                undo: {
                    foo: null,
                },
            });
            diff = stateMgr.update({
                "foo/baz": "bar",
            });
            (0, globals_1.expect)(diff).toEqual({
                redo: {
                    "foo/baz": "bar",
                },
                undo: {
                    foo: "bar",
                },
            });
            diff = stateMgr.update({
                "foo/baz": "bar",
            });
            (0, globals_1.expect)(diff).toBeNull();
            diff = stateMgr.update({
                foo: null,
            });
            (0, globals_1.expect)(diff).toEqual({
                redo: {
                    "foo/baz": null,
                },
                undo: {
                    "foo/baz": "bar",
                },
            });
            diff = stateMgr.update({
                bang: null,
            });
            (0, globals_1.expect)(diff).toBeNull();
        });
        (0, globals_1.it)("makes diffs for updates with multiple entries", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    a: 1,
                    b: 1,
                    c: 1,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        a: 1,
                        b: 1,
                        c: 1,
                    },
                    undo: {
                        a: null,
                        b: null,
                        c: null,
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    b: 2,
                    c: 2,
                    d: 2,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        b: 2,
                        c: 2,
                        d: 2,
                    },
                    undo: {
                        b: 1,
                        c: 1,
                        d: null,
                    },
                });
            }
        });
        (0, globals_1.it)("val to empty obj", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    foo: {
                        bar: 5,
                    },
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "foo/bar": 5,
                    },
                    undo: {
                        "foo/bar": null,
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    foo: {
                        bar: {},
                        baz: 7,
                    },
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "foo/baz": 7,
                    },
                    undo: {
                        "foo/baz": null,
                    },
                });
                console.log(stateMgr.get());
            }
        });
        (0, globals_1.it)("shrink diff", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    foo: {
                        bar: {
                            baz: {
                                n: 5,
                            },
                        },
                    },
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "foo/bar/baz/n": 5,
                    },
                    undo: {
                        "foo/bar/baz/n": null,
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    foo: null,
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "foo/bar/baz/n": null,
                    },
                    undo: {
                        "foo/bar/baz/n": 5,
                    },
                });
            }
        });
        (0, globals_1.it)("generated 1", () => {
            const stateMgr = new state_manager_1.StateManager();
            {
                const diff = stateMgr.update({
                    "orb/fao/arr/oar/oro": 231,
                    "for/bfb/rrf/rff": 0.108941585665983,
                    "oao/bfa": "roobobf",
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "orb/fao/arr/oar/oro": 231,
                        "for/bfb/rrf/rff": 0.108941585665983,
                        "oao/bfa": "roobobf",
                    },
                    undo: {
                        "orb/fao/arr/oar/oro": null,
                        "for/bfb/rrf/rff": null,
                        "oao/bfa": null,
                    },
                });
            }
            {
                const diff = stateMgr.update({
                    orb: {},
                    for: {},
                    oao: {},
                });
                (0, globals_1.expect)(diff).toEqual({
                    redo: {
                        "orb/fao/arr/oar/oro": null,
                        "for/bfb/rrf/rff": null,
                        "oao/bfa": null,
                    },
                    undo: {
                        "orb/fao/arr/oar/oro": 231,
                        "for/bfb/rrf/rff": 0.108941585665983,
                        "oao/bfa": "roobobf",
                    },
                });
            }
        });
    });
});
//# sourceMappingURL=state-manager.test.js.map