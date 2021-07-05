import { Data, /*Update,*/ Diff, StateManager, Watcher } from '../../src/js/state_manager';

type WatchEvent = {
    path: string[],
    oldVal: Data,
    newVal: Data,
};
type Log = WatchEvent[];

function loggingWatcher(log: Log): Watcher {
    return (path, oldVal, newVal) => log.push({ path, oldVal, newVal });
}

describe('class StateManager', () => {
    describe('update & watch', () => {
        it('basic', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'name');

            stateMgr.update({
                foo: 'bar',
            });
            expect(log.length).toEqual(0);

            stateMgr.update({
                name: 'jake',
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'name' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual('jake');

            stateMgr.update({
                name: {
                    jake: 5,
                },
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'name' ]);
            expect(log[log.length - 1].oldVal).toEqual('jake');
            expect(log[log.length - 1].newVal).toEqual({ jake: 5 });

            stateMgr.update({
                'name/jake': 2,
            });
            expect(log.length).toEqual(3);
            expect(log[log.length - 1].path).toEqual([ 'name' ]);
            expect(log[log.length - 1].oldVal).toEqual({ jake: 5 });
            expect(log[log.length - 1].newVal).toEqual({ jake: 2 });

            stateMgr.update({
                name: null,
            });
            expect(log.length).toEqual(4);
            expect(log[log.length - 1].path).toEqual([ 'name' ]);
            expect(log[log.length - 1].oldVal).toEqual({ jake: 2 });
            expect(log[log.length - 1].newVal).toBeNull();
        });

        it('deeply-bubbling-up update', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo');

            stateMgr.update({
                'foo/bar/baz/qux': { 'bag': 5 },
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual({ bar: { baz: { qux: { bag: 5 } } } });

            stateMgr.update({
                'foo/bar/baz/qux/zzz/mmo': 5,
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toEqual({ bar: { baz: { qux: { bag: 5 } } } });
            expect(log[log.length - 1].newVal).toEqual({ bar: { baz: { qux: { bag: 5, zzz: { mmo: 5 } } } } });
        });

        it('wildcard', () => {
            const stateMgr = new StateManager();
            stateMgr.update({
                people: {
                    jack: {
                        age: 5,
                    }
                }
            });

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'people/*/age');

            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'people', 'jack', 'age' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual(5);

            stateMgr.update({
                'people/bill/age': 74,
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'people', 'bill', 'age' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual(74);

            stateMgr.update({
                'people/morty': {
                    age: 14,
                }
            });
            expect(log.length).toEqual(3);
            expect(log[log.length - 1].path).toEqual([ 'people', 'morty', 'age' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual(14);

            stateMgr.update({
                people: {
                    suri: {
                        age: 26,
                    }
                },
            });
            expect(log.length).toEqual(7);

            const changes = log.slice(3);
            expect(new Set(changes)).toEqual(new Set([
                { path: [ 'people', 'jack', 'age' ], oldVal: 5, newVal: null },
                { path: [ 'people', 'bill', 'age' ], oldVal: 74, newVal: null },
                { path: [ 'people', 'morty', 'age' ], oldVal: 14, newVal: null },
                { path: [ 'people', 'suri', 'age' ], oldVal: null, newVal: 26 },
            ]));
        });
    });

    describe('delete', () => {
        it('basic delete', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo');

            stateMgr.update({
                'foo/bar/baz': 5,
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual({ bar: { baz: 5 } });

            stateMgr.update({
                'foo': null,
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toEqual({ bar: { baz: 5 } });
            expect(log[log.length - 1].newVal).toBeNull();
        });

        it('deeply-cascading delete', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo/bar/baz/qux');

            stateMgr.update({
                'foo/bar/baz/qux': 5,
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo', 'bar', 'baz', 'qux' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual(5);

            stateMgr.update({
                'foo': null,
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'foo', 'bar', 'baz', 'qux' ]);
            expect(log[log.length - 1].oldVal).toEqual(5);
            expect(log[log.length - 1].newVal).toBeNull();
        });

        it('no-op deletes', () => {
            const stateMgr = new StateManager();
            stateMgr.update({
                foo: {
                    bar: 5,
                }
            });

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), false, 'foo');

            stateMgr.update({
                'foo/bar/baz/qux': {},
            });
            expect(log.length).toEqual(0);

            stateMgr.update({
                'foo/bar/baz/qux': null,
            });
            expect(log.length).toEqual(0);

            stateMgr.update({
                'foo/bar/baz/qux': undefined,
            });
            expect(log.length).toEqual(0);

            stateMgr.update({
                'foo/bar/baz/qux': [],
            });
            expect(log.length).toEqual(0);

            stateMgr.update({
                'foo/bar/baz/qux': '',
            });
            expect(log.length).toEqual(1);
        });
    });

    describe('triggerNow', () => {
        it('trigger on existing value', () => {
            const stateMgr = new StateManager();
            stateMgr.update({
                'foo': 'bar',
            });

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo');

            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual('bar');
        });

        it('ignore empty', () => {
            const stateMgr = new StateManager();
            stateMgr.update({
                'foo': 'bar',
            });

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'baz');

            expect(log.length).toEqual(0);
        });

        it('trigger on existing with wildcard', () => {
            const stateMgr = new StateManager();
            stateMgr.update({
                ages: {
                    jake: 50,
                    jason: 52,
                    morty: 14,
                    mingwei: 23,
                },
            });

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'ages/*');

            expect(log.length).toEqual(4);

            let foundMorty = false;
            for (const row of log) {
                expect(row.path.length).toBe(2);
                expect(row.path[0]).toBe('ages');

                if ('morty' === row.path[1]) {
                    expect(row.oldVal).toBeNull();
                    expect(row.newVal).toEqual(14);
                    foundMorty = true;
                }
            }
            expect(foundMorty).toBeTruthy();
        });
    });

    describe('edge cases', () => {
        it('overwrite primitive', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo');

            stateMgr.update({
                foo: 5,
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual(5);

            stateMgr.update({
                'foo/bar': 10,
            });
            expect(log.length).toEqual(2);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toEqual(5);
            expect(log[log.length - 1].newVal).toEqual({ bar: 10 });
        });

        it('arrays convert to objects', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            stateMgr.watch(loggingWatcher(log), true, 'foo');

            stateMgr.update({
                'foo': [ 5 ],
            });
            expect(log.length).toEqual(1);
            expect(log[log.length - 1].path).toEqual([ 'foo' ]);
            expect(log[log.length - 1].oldVal).toBeNull();
            expect(log[log.length - 1].newVal).toEqual({ 0: 5 });
        });

        it('cannot watch root', () => {
            const stateMgr = new StateManager();

            const log: Log = [];
            expect(() => stateMgr.watch(loggingWatcher(log), true, '')).toThrow();
        });
    });

    describe('diff', () => {
        it('makes diffs', () => {
            const stateMgr = new StateManager();

            let diff: null | Diff;
            diff = stateMgr.update({
                foo: 'bar',
            });
            expect(diff).toEqual({
                redo: {
                    foo: 'bar',
                },
                undo: {
                    foo: null,
                },
            });

            diff = stateMgr.update({
                'foo/baz': 'bar',
            });
            expect(diff).toEqual({
                redo: {
                    'foo/baz': 'bar',
                },
                undo: {
                    foo: 'bar',
                },
            });

            diff = stateMgr.update({
                'foo/baz': 'bar',
            });
            expect(diff).toBeNull();

            diff = stateMgr.update({
                foo: null,
            });
            expect(diff).toEqual({
                redo: {
                    'foo/baz': null,
                },
                undo: {
                    'foo/baz': 'bar',
                },
            });

            diff = stateMgr.update({
                'bang': null,
            });
            expect(diff).toBeNull();
        });

        it('val to empty obj', () => {
            const stateMgr = new StateManager();

            {
                const diff = stateMgr.update({
                    foo: {
                        bar: 5,
                    },
                });
                expect(diff).toEqual({
                    redo: {
                        'foo/bar': 5,
                    },
                    undo: {
                        'foo/bar': null,
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
                expect(diff).toEqual({
                    redo: {
                        'foo/baz': 7,
                    },
                    undo: {
                        'foo/baz': null,
                    },
                });
                console.log(stateMgr.get());
            }
        });

        it('shrink diff', () => {
            const stateMgr = new StateManager();

            {
                const diff = stateMgr.update({
                    foo: {
                        bar: {
                            baz: {
                                n: 5,
                            }
                        }
                    }
                });
                expect(diff).toEqual({
                    redo: {
                        'foo/bar/baz/n': 5,
                    },
                    undo: {
                        'foo/bar/baz/n': null,
                    },
                });
            }

            {
                const diff = stateMgr.update({
                    foo: null
                });
                expect(diff).toEqual({
                    redo: {
                        'foo/bar/baz/n': null,
                    },
                    undo: {
                        'foo/bar/baz/n': 5,
                    },
                });
            }
        });

        it('generated 1', () => {
            const stateMgr = new StateManager();

            {
                const diff = stateMgr.update({
                    'orb/fao/arr/oar/oro': 231,
                    'for/bfb/rrf/rff': 0.108941585665983,
                    'oao/bfa': 'roobobf',
                });
                expect(diff).toEqual({
                    redo: {
                        'orb/fao/arr/oar/oro': 231,
                        'for/bfb/rrf/rff': 0.108941585665983,
                        'oao/bfa': 'roobobf'
                    },
                    undo: {
                        'orb/fao/arr/oar/oro': null,
                        'for/bfb/rrf/rff': null,
                        'oao/bfa': null,
                    },
                });
            }

            {
                const diff = stateMgr.update({
                    'orb': {},
                    'for': {},
                    'oao': {},
                });
                expect(diff).toEqual({
                    redo: {
                        'orb/fao/arr/oar/oro': null,
                        'for/bfb/rrf/rff': null,
                        'oao/bfa': null,
                    },
                    undo: {
                        'orb/fao/arr/oar/oro': 231,
                        'for/bfb/rrf/rff': 0.108941585665983,
                        'oao/bfa': 'roobobf'
                    },
                });
            }
        });

        // it('random fuzzing', () => {
        //     const stateMgr = new StateManager();

        //     for (let i = 0; i < 3; i++) {
        //         const oldData = stateMgr.get();
        //         const update: Update = createRandomUpdate() as Update;
        //         const diff = stateMgr.update(update);
        //         console.log({ i, oldData, update, diff });
        //     }
        // });
    });
});



// // https://stackoverflow.com/a/2443944/2398020
// function createRandomUpdate(root: boolean = true): Update | Data {
//     const fields = Math.random() * 5;

//     const generatedObj: any = {};

//     for (let i = 0; i < fields; i++) {
//         let generatedObjField: unknown;

//         switch (randomInt(6)) {
//             case 0:
//                 generatedObjField = randomInt(1000);
//                 break;
//             case 1:
//                 generatedObjField = Math.random();
//                 break;
//             case 2:
//                 generatedObjField = Math.random() < 0.5 ? true : false;
//                 break;
//             case 3:
//                 generatedObjField = randomString(randomInt(4) + 4);
//                 break;
//             case 4:
//                 generatedObjField = null;
//                 break;
//             case 5:
//                 generatedObjField = createRandomUpdate(false);
//                 break;
//             default: throw 'UNREACHABLE';
//         }

//         const key = root
//             ? Array(1 + randomInt(5)).fill(0).map(() => randomString(3)).join('/')
//             : randomString(8);

//         generatedObj[key] = generatedObjField;
//     }

//     return generatedObj;
// }
// function randomInt(bound: number): number {
//     return Math.floor(Math.random() * bound);
// }

// function randomString(size: number): string {
//     var alphaChars = "fobar";
//     var generatedString = '';
//     for(var i = 0; i < size; i++) {
//         generatedString += alphaChars[randomInt(alphaChars.length)];
//     }

//     return generatedString;
// }
