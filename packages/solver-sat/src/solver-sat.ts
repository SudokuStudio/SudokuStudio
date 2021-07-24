import { load as loadCryptoMiniSat, lbool } from 'cryptominisat';
import { loadPbLib } from './pblib';
import { arrayObj2array, cellCoord2CellIdx, cellIdx2cellCoord, diagonalIdx2diagonalCellCoords } from '@sudoku-studio/board-utils';
import { Coord, Geometry, Grid, IdxMap, schema } from '@sudoku-studio/schema';

const cryptoMiniSatPromise = loadCryptoMiniSat();

const asyncYield = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function* product(...args: number[]): Generator<number[], void, void> {
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

function *knightMoves(N: number): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void> {
    for (const [ y0, x0, y1, x1 ] of product(N, N, N, N)) {
        if (y0 >= y1) continue; // Don't double-count.
        const dy = Math.abs(y0 - y1);
        const dx = Math.abs(x0 - x1);
        if (3 !== dy + dx) continue;
        if (1 !== Math.abs(dy - dx)) continue;
        yield [
            [ x0, y0 ],
            [ x1, y1 ],
        ];
    }
}

function* kingMoves(N: number): Generator<[Coord<Geometry.CELL>, Coord<Geometry.CELL>], void, void> {
    for (const [ y0, x0, y1, x1 ] of product(N, N, N, N)) {
        if (y0 >= y1) continue; // Don't double-count.
        const dy = Math.abs(y0 - y1);
        if (1 !== dy) continue;
        const dx = Math.abs(x0 - x1);
        if (1 !== dx) continue;

        yield [
            [ x0, y0 ],
            [ x1, y1 ],
        ];
    }
}

/**
 * CryptoMiniSat uses unsigned u32s with the lowest bit representing negation.
 * This converts from standard negative/positive literal representation to CMS's representation.
 * @param literal negative/positive literal.
 * @returns CMS literal.
 */
function literalToCms(literal: number): number {
    return 2 * (Math.abs(literal) - 1) + (+(literal < 0));
}

export type CancellationToken = {
    cancelled?: true
};

export function cantAttempt(board: schema.Board): null | string {
    if (board.grid.width !== board.grid.height) {
        return 'Grid is not square.';
    }

    for (const { type } of Object.values(board.elements)) {
        if (!(type in ELEMENT_HANDLERS)) {
            return `Cannot handle ${JSON.stringify(type)} element.`;
        }
    }
    return null;
}

export async function solve(board: schema.Board, maxSolutions: number,
    onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void,
    cancellationToken: CancellationToken = {}): Promise<boolean>
{
    const pbLib = await loadPbLib;

    const size = board.grid.width;
    const context: Context = {
        clauses: [],
        size,
        grid: board.grid,
        getLiteral: (y, x, v) => 1 + y * size * size + x * size + v,
        pbLib,
    }

    const baseVars = Math.pow(context.size, 3);
    let numVars = 1 + baseVars;

    for (const element of Object.values(board.elements)) {
        if (cancellationToken.cancelled) return false;

        const handler: null | ((numVars: number, element: schema.Element, context: Context) => number) =
            ELEMENT_HANDLERS[element.type as keyof typeof ELEMENT_HANDLERS] as any;
        if (undefined === handler) console.warn(`Ignoring constraint: ${element.type}`);
        if (null != handler) {
            numVars = handler(numVars, element, context);
        }
    }

    // Create solver instance.
    const sat = await cryptoMiniSatPromise;
    const satSolverPtr = sat.cmsat_new();
    try {
        console.log(`Running SAT Solver: ${numVars} vars (${baseVars} base), ${context.clauses.length} clauses.`);

        // sat.cmsat_set_verbosity(satSolverPtr, 1);
        sat.cmsat_new_vars(satSolverPtr, numVars);

        // Add clauses.
        for (const clause of context.clauses) {
            sat.cmsat_add_clause(satSolverPtr, clause.map(literalToCms));
        }
        context.clauses.length = 0; // Let the giant clause list be GC'd.

        for (let _i = 0; _i < maxSolutions; _i++) {
            let status = sat.cmsat_simplify(satSolverPtr);
            do {
                await asyncYield();
                if (cancellationToken.cancelled) return false;

                sat.cmsat_set_max_time(satSolverPtr, 0.1);
                status = sat.cmsat_solve(satSolverPtr);
            } while (lbool.UNDEF === status);

            if (lbool.FALSE === status)
                break;

            // SOLVED!
            const model = sat.cmsat_get_model(satSolverPtr);
            const solution: IdxMap<Geometry.CELL, number> = {};
            const excludeSolutionClause: number[] = [];
            for (const [ y, x, v ] of product(size, size, size)) {
                const literal = context.getLiteral(y, x, v);
                const litVal = model[literal - 1];
                if (lbool.TRUE === litVal) {
                    const cellIdx = cellCoord2CellIdx([ x, y ], context.grid);
                    if (undefined !== solution[cellIdx]) throw 'INVALID';

                    excludeSolutionClause.push(-literal);
                    solution[cellIdx] = 1 + v;
                }
            }
            onSolutionFoundOrComplete(solution);

            sat.cmsat_add_clause(satSolverPtr, excludeSolutionClause.map(literalToCms));
        }

        // Complete.
        onSolutionFoundOrComplete(null);
        return true;
    }
    finally {
        sat.cmsat_free(satSolverPtr);
    }
}

type Context = {
    clauses: number[][],
    size: number,
    grid: Grid,
    getLiteral: (y: number, x: number, v: number) => number,
    pbLib: (typeof loadPbLib) extends Promise<infer T> ? T : never,
};

export const ELEMENT_HANDLERS = {
    corner: null,
    center: null,
    colors: null,

    grid(numVars: number, _element: schema.GridElement, context: Context): number {
        const ones = Array(context.size).fill(1);
        for (const [ a, b ] of product(context.size, context.size)) {
            const cel: number[] = [];
            const row: number[] = [];
            const col: number[] = [];
            for (const [ c ] of product(context.size)) {
                cel.push(context.getLiteral(a, b, c));
                row.push(context.getLiteral(a, c, b));
                col.push(context.getLiteral(c, a, b));
            }
            numVars = context.pbLib.encodeBoth(ones, cel, 1, 1, context.clauses, numVars);
            numVars = context.pbLib.encodeBoth(ones, row, 1, 1, context.clauses, numVars);
            numVars = context.pbLib.encodeBoth(ones, col, 1, 1, context.clauses, numVars);
        }

        return numVars;
    },

    box(numVars: number, _element: schema.BoxElement, context: Context): number {
        // TODO: ELEMENT VALUE IS UNUSED.

        const ones = Array(context.size).fill(1);
        for (const [ val, bx ] of product(context.size, context.size)) {
            const box: number[] = [];
            for (const [ pos ] of product(context.size)) {
                box.push(context.getLiteral(Math.floor(bx / 3) * 3 + Math.floor(pos / 3), (bx % 3) * 3 + (pos % 3), val));
            }
            numVars = context.pbLib.encodeBoth(ones, box, 1, 1, context.clauses, numVars);
        }

        return numVars;
    },

    disjointGroups(numVars: number, element: schema.BoxElement, context: Context): number {
        if (element.value) {
            const ones = Array(context.size).fill(1);
            for (const [ val, pos ] of product(context.size, context.size)) {
                const box: number[] = [];
                for (const [ bx ] of product(context.size)) {
                    box.push(context.getLiteral(Math.floor(bx / 3) * 3 + Math.floor(pos / 3), (bx % 3) * 3 + (pos % 3), val));
                }
                numVars = context.pbLib.encodeBoth(ones, box, 1, 1, context.clauses, numVars);
            }
        }
        return numVars;
    },

    givens(numVars: number, element: schema.DigitElement, context: Context): number {
        for (const [ cellIdx, value1 ] of Object.entries(element.value || {})) {
            const v = value1! - 1;
            const [ x, y ] = cellIdx2cellCoord(+cellIdx, context.grid);

            const literal = context.getLiteral(y, x, v);
            context.clauses.push([ literal ]);
        }
        return numVars;
    },

    filled(numVars: number, element: schema.DigitElement, context: Context): number {
        // Treat filled same as givens (TODO? Make configurable).
        return ELEMENT_HANDLERS.givens(numVars, element, context);
    },

    knight(numVars: number, element: schema.BooleanElement, context: Context): number {
        return handleMoves(numVars, element, context, knightMoves);
    },

    king(numVars: number, element: schema.BooleanElement, context: Context): number {
        console.log(context.clauses.length);
        numVars = handleMoves(numVars, element, context, kingMoves);
        console.log(context.clauses.length);
        return numVars;
    },

    littleKiller(numVars: number, element: schema.LittleKillerElement, context: Context): number {
        for (const [ diagIdx, sum ] of Object.entries(element.value || {})) {
            if ('number' !== typeof sum) continue;

            const lits = [];
            const weights = [];
            for (const [ x, y ] of diagonalIdx2diagonalCellCoords(+diagIdx, context.grid)) {
                for (const [ v ] of product(context.size)) {
                    lits.push(context.getLiteral(y, x, v));
                    weights.push(1 + v);
                }
            }
            numVars = context.pbLib.encodeBoth(weights, lits, sum, sum, context.clauses, numVars);
        }
        return numVars;
    },

    thermo(numVars: number, element: schema.LineElement, context: Context): number {
        for (const thermoCells of Object.values(element.value || {})) {
            const thermoCellsArr = arrayObj2array(thermoCells);
            for (let i = 1; i < thermoCellsArr.length; i++) {
                const [ prevX, prevY ] = cellIdx2cellCoord(thermoCellsArr[i - 1], context.grid);
                const [ nextX, nextY ] = cellIdx2cellCoord(thermoCellsArr[i],     context.grid);
                for (let large = 1; large < context.size; large++) {
                    for (let small = 0; small <= large; small++) { // Or equal for regular thermo.
                        const largePrevLit = context.getLiteral(prevY, prevX, large);
                        const smallNextLit = context.getLiteral(nextY, nextX, small);
                        // Prevent large preceding small.
                        context.clauses.push([ -largePrevLit, -smallNextLit ]);
                    }
                }
            }
        }
        return numVars;
    },

    arrow(numVars: number, element: schema.ArrowElement, context: Context): number {
        for (const { bulb, body } of Object.values(element.value || {})) {
            // Reverse so least significant digit first.
            const bulbArrReversed = arrayObj2array(bulb);
            bulbArrReversed.reverse();
            // Discard start (which is on cell head).
            const [ _bodyStart, ...bodyArrRest ] = arrayObj2array(body);
            if (0 >= bulbArrReversed.length || 1 >= bodyArrRest.length) continue;

            const weights: number[] = [];
            const lits: number[] = [];

            // Bulb -- do in reverse order to handle ones place first.
            {
                let power = 1;
                for (const bulbCellIdx of bulbArrReversed) {
                    const [ x, y ] = cellIdx2cellCoord(bulbCellIdx, context.grid);
                    for (const [ v ] of product(context.size)) {
                        const bulbDigitLiteral = context.getLiteral(y, x, v);
                        const value = 1 + v;
                        weights.push(power * value);
                        lits.push(bulbDigitLiteral);
                    }
                    power *= 10;
                }
            }

            // Arrow.
            {
                for (const bodyCellIdx of bodyArrRest) {
                    const [ x, y ]  = cellIdx2cellCoord(bodyCellIdx, context.grid);
                    for (const [ v ] of product(context.size)) {
                        const bodyLiteral = context.getLiteral(y, x, v);
                        const value = 1 + v;
                        weights.push(-value); // Body subtracts from the head.
                        lits.push(bodyLiteral);
                    }
                }
            }

            // Set HEAD - BODY = 0;
            numVars = context.pbLib.encodeBoth(weights, lits, 0, 0, context.clauses, numVars);
        }
        return numVars;
    },
} as const;

function handleMoves(numVars: number, element: schema.BooleanElement, context: Context, func: typeof knightMoves): number {
    if (element.value) {
        for (const [[ x0, y0 ], [ x1, y1 ]] of func(context.size)) {
            for (const [ v ] of product(context.size)) {
                const aLit = context.getLiteral(y0, x0, v);
                const bLit = context.getLiteral(y1, x1, v);
                context.clauses.push([ -aLit, -bLit ]); // Cannot both be true.
            }
        }
    }
    return numVars;
}
