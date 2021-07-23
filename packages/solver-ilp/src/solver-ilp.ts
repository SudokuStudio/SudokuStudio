import loadCryptoMiniSat from 'cryptominisat';
import { loadPbLib } from './pblib';

const cryptoMiniSat = loadCryptoMiniSat();

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
    const { Module: sat } = await cryptoMiniSat;
    const pblib = await loadPbLib;

    console.log({ sat });

    const START = Date.now();


    function getVar(y: number, x: number, v: number): number {
        return 1 + 81 * y + 9 * x + v;
    }
    // function lit(x: number, negate: boolean): number {
    //     return ((x - 1) << 1) + (+negate);
    // }
    function cmsLit(x: number): number {
        return ((Math.abs(x) - 1) << 1) + (+(x < 0));
    }

    const clauses: number[][] = [];
    let n = 1 + 9 * 9 * 9;

    for (let a = 0; a < 9; a++) {
        for (let b = 0; b < 9; b++) {
            const cel: number[] = [];
            const row: number[] = [];
            const col: number[] = [];
            const box: number[] = [];

            for (let c = 0; c < 9; c++) {
                cel.push(getVar(a, b, c));
                row.push(getVar(a, c, b));
                col.push(getVar(c, a, b));
                box.push(getVar(Math.floor(b / 3) * 3 + Math.floor(c / 3), (b % 3) * 3 + (c % 3), a));
            }

            const ones = Array(9).fill(1);
            n = pblib.encodeBoth(ones, cel, 1, 1, clauses, n);
            n = pblib.encodeBoth(ones, row, 1, 1, clauses, n);
            n = pblib.encodeBoth(ones, col, 1, 1, clauses, n);
            n = pblib.encodeBoth(ones, box, 1, 1, clauses, n);
        }
    }

    const littleKillers = [
        [ 51, [ 2, 0 ], [  1,  1 ] ],
        [ 15, [ 6, 0 ], [  1,  1 ] ],
        [ 40, [ 0, 4 ], [  1, -1 ] ],
        [ 43, [ 0, 6 ], [  1, -1 ] ],
        [ 13, [ 8, 2 ], [ -1,  1 ] ],
        [ 25, [ 8, 4 ], [ -1,  1 ] ],
        [ 28, [ 3, 8 ], [ -1, -1 ] ],
        [ 10, [ 4, 8 ], [ -1, -1 ] ],
    ] as const;

    for (let [ sum, [ y, x ], [ dy, dx ] ] of littleKillers) {
        const vars: number[] = [];
        const weights: number[] = [];

        while (0 <= y && y < 9 && 0 <= x && x < 9) {
            for (let v = 0; v < 9; v++) {
                vars.push(getVar(y, x, v));
                weights.push(1 + v);
            }
            y += dy;
            x += dx;
        }

        n = pblib.encodeBoth(weights, vars, sum, sum, clauses, n);
    }

    console.log(`${n} vars, ${clauses.length} clauses.`);

    const satSolverPtr = sat.cmsat_new();
    sat.cmsat_new_vars(satSolverPtr, n);

    for (const clause of clauses) {
        sat.cmsat_add_clause(satSolverPtr, clause.map(cmsLit));
    }

    let status;
    do {
        await new Promise<void>(resolve => setTimeout(resolve, 0));

        sat.cmsat_set_max_time(satSolverPtr, 0.1);
        status = sat.cmsat_solve(satSolverPtr);

        console.log(status, Date.now());
    } while (2 === status);

    if (0 === status) {
        const model = sat.cmsat_get_model(satSolverPtr);
        console.log({ model });

        const str: string[] = [];
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                for (let v = 0; v < 9; v++) {
                    const val = model[getVar(y, x, v) - 1];
                    if (0 === val /* TRUE */) {
                        str.push(`${1 + v}`);
                    }
                }
            }
            str.push('\n');
        }
        console.log(str.join(''));
    }
    console.log('TIME', Date.now() - START);


    // {
    //     const pblib = await loadPbLib;

    //     console.log(pblib);

    //     const f: number[][] = [];
    //     pblib.encodeBoth([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], 23, 23, f, 100);
    //     console.log(f);
    // }
}

    // sat.cmsat_new_vars(satSolverPtr, 2);
    // const nvars = sat.cmsat_nvars(satSolverPtr);
    // console.log({ nvars });

    // sat.cmsat_add_clause(satSolverPtr, [ lit(0, false), lit(1,  true) ]);
    // sat.cmsat_add_clause(satSolverPtr, [ lit(0,  true), lit(1, false) ]);

    // sat.cmsat_add_clause(satSolverPtr, [ lit(0, false), lit(1, false) ]);
    // sat.cmsat_add_clause(satSolverPtr, [ lit(0, false), lit(1,  true) ]);
    // sat.cmsat_add_clause(satSolverPtr, [ lit(0,  true), lit(1, false) ]);
    // sat.cmsat_add_clause(satSolverPtr, [ lit(0,  true), lit(1,  true) ]);
    // /*
    //     c ---------------------------
    //     c This is a very simply example CNF.
    //     c It encodes that:
    //     c    v1 OR  v2 = True
    //     c    v1 OR -v2 = True
    //     c   -v1 OR  v2 = True
    //     c   -v1 OR -v2 = True
    //     c
    //     c  Which cannot be satisfied. The solution should therefore be UNSATISFIABLE
    //     c  Note that this problem is solved with Strongly Connected Component analysis (scc)
    //     c ---------------------------
    //     c
    //     1 2 0
    //     1 -2 0
    //     -1 2 0
    //     -1 -2 0
    // */