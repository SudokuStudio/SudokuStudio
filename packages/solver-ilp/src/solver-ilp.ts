import { loadCms } from './cryptominisat';
import { loadPbLib } from './pblib';

export const N = 9;

export function* product(...args: number[]): Generator<number[], void, void> {
    if (0 === args.length) {
        yield [];
    }
    else {
        for (let i = 0; i < args[0]; i++) {
            for (const x of product(...args.slice(1))) {
                x.unshift(i);
                yield x;
            }
        }
    }
}

export async function findSudokuSolution() {
    const sat = await loadCms;

    console.log({ sat });

    sat.start_solve(`
c ---------------------------
c This is a very simply example CNF.
c It encodes that:
c    v1 OR  v2 = True
c    v1 OR -v2 = True
c   -v1 OR  v2 = True
c   -v1 OR -v2 = True
c
c  Which cannot be satisfied. The solution should therefore be UNSATISFIABLE
c  Note that this problem is solved with Strongly Connected Component analysis (scc)
c ---------------------------
c
1 2 0
1 -2 0
-1 2 0
-1 -2 0
`);

    const pblib = await loadPbLib;

    console.log(pblib);

    const f: number[][] = [];
    pblib.encodeBoth([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], 23, 23, f, 100);
    console.log(f);
}
