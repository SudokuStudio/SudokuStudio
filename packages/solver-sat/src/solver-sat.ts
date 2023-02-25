import { load as loadCryptoMiniSat, lbool, Module } from '@sudoku-studio/cryptominisat';
import loadPbLib from '@sudoku-studio/pblib';
import { arrayObj2array, cellCoord2CellIdx, cellIdx2cellCoord, cornerCoord2cellCoords, cornerIdx2cornerCoord, diagonalIdx2diagonalCellCoords, edgeIdx2cellIdxes, getBorderCellPairs, getMajorDiagonal, idxMapToKeysArray, kingMoves, knightMoves, getOrthogonallyAdjacentPairs, product, seriesIdx2CellCoords, solutionToString } from '@sudoku-studio/board-utils';
import { ArrayObj, Coord, Geometry, Grid, IdxMap, schema } from '@sudoku-studio/schema';

type Context = {
    clauses: number[][],
    size: number,
    grid: Grid,
    getLiteral: (y: number, x: number, v: number) => number,
    pbLib: ReturnType<typeof loadPbLib> extends Promise<infer T> ? T : never,
};

const cryptoMiniSatPromise = loadCryptoMiniSat();
const pbLibPromise = loadPbLib();

const asyncYield = () => new Promise<void>(resolve => setTimeout(resolve, 0));

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

async function solveHelper(
    sat: Module,
    numLits: number,
    context: Context,
    size: number,
    maxSolutions: number,
    additionalClauses: number[][],
    cancellationToken: CancellationToken,
    onSolutionFound: (solution: IdxMap<Geometry.CELL, number>) => void,
    onComplete: () => void,
): Promise<boolean> {
    // Create solver instance.
    const satSolverPtr = sat.cmsat_new();
    try {
        sat.cmsat_new_vars(satSolverPtr, numLits);

        // Add clauses.
        for (const clause of context.clauses.concat(additionalClauses)) {
            sat.cmsat_add_clause(satSolverPtr, clause.map(literalToCms));
        }

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
            onSolutionFound(solution);

            sat.cmsat_add_clause(satSolverPtr, excludeSolutionClause.map(literalToCms));
        }

        // Complete.
        onComplete();
        return true;
    }
    finally {
        sat.cmsat_free(satSolverPtr);
    }
}

export async function solve(board: schema.Board, maxSolutions: number,
    onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void,
    cancellationToken: CancellationToken = {}): Promise<boolean>
{
    const pbLib = await pbLibPromise;

    const size = board.grid.width;
    const context: Context = {
        clauses: [],
        size,
        grid: board.grid,
        getLiteral: (y, x, v) => 1 + y * size * size + x * size + v,
        pbLib,
    }

    const numBaseVars = Math.pow(context.size, 3);
    let numLits = numBaseVars;

    for (const element of Object.values(board.elements)) {
        if (cancellationToken.cancelled) return false;

        const handler: null | ((numLits: number, element: schema.Element, context: Context) => number) =
            ELEMENT_HANDLERS[element.type as keyof typeof ELEMENT_HANDLERS] as any;
        if (undefined === handler) console.warn(`Ignoring constraint: ${element.type}`);
        if (null != handler) {
            numLits = handler(numLits, element, context);
        }
    }

    const sat = await cryptoMiniSatPromise;

    return solveHelper(
        sat,
        numLits,
        context,
        size,
        maxSolutions,
        [],
        cancellationToken,
        onSolutionFoundOrComplete,
        () => onSolutionFoundOrComplete(null),
    );
}

function updateValidCandidatesForSolutions(
    solutions: IdxMap<typeof Geometry.CELL, number>[],
    validCandidates: IdxMap<Geometry.CELL, Map<number, number>>,
    foundSolutions: Record<string, boolean>,
    grid: Grid,
    size: number,
) {
    for (const solution of solutions) {
        const representation = solutionToString(solution, grid);
        if (representation in foundSolutions) continue;

        for (let cellIndex = 0; cellIndex < size * size; cellIndex++) {
            const value = solution[cellIndex];
            if (undefined === value) continue;

            const count = validCandidates[cellIndex]?.get(value) || 0;
            validCandidates[cellIndex]?.set(value, count+1);
        }
        foundSolutions[representation] = true;
    }
}

export async function solveTrueCandidates(board: schema.Board,
    onComplete: (candidates: null | IdxMap<Geometry.CELL, Map<number, number>>) => void,
    cancellationToken: CancellationToken = {}): Promise<boolean>
{
    const pbLib = await pbLibPromise;

    const size = board.grid.width;
    const context: Context = {
        clauses: [],
        size,
        grid: board.grid,
        getLiteral: (y, x, v) => 1 + y * size * size + x * size + v,
        pbLib,
    }

    const numBaseVars = Math.pow(context.size, 3);
    let numLits = numBaseVars;

    // Create a boolean array tracking which cells have givens
    const givens: IdxMap<Geometry.CELL, number> = {};
    for (const element of Object.values(board.elements)) {
        if (cancellationToken.cancelled) return false;
        if (element.type === 'filled') continue;
        if (element.type === 'givens') {
            for (const [ cellIdx, value1 ] of Object.entries(element.value || {})) {
                givens[cellIdx] = value1!;
            }
        }

        const handler: null | ((numLits: number, element: schema.Element, context: Context) => number) =
            ELEMENT_HANDLERS[element.type as keyof typeof ELEMENT_HANDLERS] as any;
        if (undefined === handler) console.warn(`Ignoring constraint: ${element.type}`);
        if (null != handler) {
            numLits = handler(numLits, element, context);
        }
    }

    const neededCandidates: Array<Array<number>> = [];
    const validCandidates: IdxMap<Geometry.CELL, Map<number, number>> = {};
    for (let cellIdx = 0; cellIdx < size * size; cellIdx++) {
        if (givens[cellIdx] === undefined) {
            neededCandidates.push(Array.from({ length: size }, (_, v) => v + 1));
        } else {
            neededCandidates.push([]);
        }
        validCandidates[cellIdx] = new Map<number, number>();
    }

    // TODO: Remove obviously invalid candidates

    // Create solver instance.
    const sat = await cryptoMiniSatPromise;

    const initialSolutions: IdxMap<typeof Geometry.CELL, number>[] = [];
    const maxSolutions = 10;

    const returnValue = await solveHelper(
        sat,
        numLits,
        context,
        size,
        maxSolutions,
        [],
        cancellationToken,
        (solution: IdxMap<Geometry.CELL, number>) => initialSolutions.push(solution),
        () => {},
    );

    if (!returnValue) {
        return false;
    }

    const foundSolutions: Record<string, boolean> = {};
    updateValidCandidatesForSolutions(initialSolutions, validCandidates, foundSolutions, context.grid, size);

    if (initialSolutions.length < maxSolutions) {
        onComplete(validCandidates);
        return true;
    }

    for (let testCellIdx = 0; testCellIdx < size * size; testCellIdx++) {
        if (cancellationToken.cancelled) return false;
        if (givens[testCellIdx] !== undefined) continue;

        for (let testValue = 1; testValue <= size; testValue++) {
            if (!neededCandidates[testCellIdx].includes(testValue)) continue;
            const currentCount = validCandidates[testCellIdx]?.get(testValue) || 0;
            if (currentCount >= maxSolutions) continue;

            const additionalClauses = [];
            const solutions: IdxMap<typeof Geometry.CELL, number>[] = [];

            // Add additional clause for the value being tested
            {
                const [ x, y ] = cellIdx2cellCoord(testCellIdx, context.grid);
                const literal = context.getLiteral(y, x, testValue - 1);
                additionalClauses.push([ literal ]);
            }

            // Add clauses for previous cells with only 1 candidate
            {
                for (let previousCellIndex = 0; previousCellIndex < testCellIdx; previousCellIndex++) {
                    const previousCellCandidates = validCandidates[previousCellIndex];
                    if (previousCellCandidates && 1 === previousCellCandidates.size) {
                        const onlyCandidate = previousCellCandidates.keys().next().value;
                        const [ x, y ] = cellIdx2cellCoord(previousCellIndex, context.grid);
                        const literal = context.getLiteral(y, x, onlyCandidate - 1);
                        additionalClauses.push([ literal ]);
                    }
                }
            }

            const returnValue = await solveHelper(
                sat,
                numLits,
                context,
                size,
                maxSolutions - currentCount,
                additionalClauses,
                cancellationToken,
                (solution: IdxMap<Geometry.CELL, number>) => solutions.push(solution),
                () => {},
            );

            if (!returnValue) {
                return false;
            }

            updateValidCandidatesForSolutions(solutions, validCandidates, foundSolutions, context.grid, size);
        }
    }

    // Complete.
    onComplete(validCandidates);
    return true;
}

export const ELEMENT_HANDLERS = {
    corner: null,
    center: null,
    colors: null,

    grid(numLits: number, _element: schema.GridElement, context: Context): number {
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
            numLits = context.pbLib.encodeBoth(ones, cel, 1, 1, context.clauses, 1 + numLits);
            numLits = context.pbLib.encodeBoth(ones, row, 1, 1, context.clauses, 1 + numLits);
            numLits = context.pbLib.encodeBoth(ones, col, 1, 1, context.clauses, 1 + numLits);
        }

        return numLits;
    },

    gridRegion(numLits: number, element: schema.GridRegionElement, context: Context): number {
        const regions = element.value || {};
        if (!regions) throw Error(`Invalid region with no cells.`);

        for (const bx of arrayObj2array(regions)) {
            const coords = idxMapToKeysArray<Geometry.CELL>(bx)
                .map(idx => cellIdx2cellCoord(idx, context.grid))
            const ones = Array(coords.length).fill(1);
            for (let val = 0; val < context.size; val++) {
                const literals = coords.map(([ x, y ]) => context.getLiteral(y, x, val));
                numLits = context.pbLib.encodeBoth(ones, literals, 1, 1, context.clauses, 1 + numLits);
            }
        }

        return numLits;
    },

    disjointGroups(numLits: number, element: schema.BooleanElement, context: Context): number {
        if (element.value) {
            const ones = Array(context.size).fill(1);
            for (const [ val, pos ] of product(context.size, context.size)) {
                const box: number[] = [];
                for (const [ bx ] of product(context.size)) {
                    box.push(context.getLiteral(Math.floor(bx / 3) * 3 + Math.floor(pos / 3), (bx % 3) * 3 + (pos % 3), val));
                }
                numLits = context.pbLib.encodeBoth(ones, box, 1, 1, context.clauses, 1 + numLits);
            }
        }
        return numLits;
    },

    givens(numLits: number, element: schema.DigitElement, context: Context): number {
        for (const [ cellIdx, value1 ] of Object.entries(element.value || {})) {
            const v = value1! - 1;
            const [ x, y ] = cellIdx2cellCoord(+cellIdx, context.grid);

            const literal = context.getLiteral(y, x, v);
            context.clauses.push([ literal ]);
        }
        return numLits;
    },

    filled(numLits: number, element: schema.DigitElement, context: Context): number {
        // Treat filled same as givens (TODO? Make configurable).
        return ELEMENT_HANDLERS.givens(numLits, element, context);
    },

    knight(numLits: number, element: schema.BooleanElement, context: Context): number {
        if (element.value) {
            numLits = encodeGlobalCellPairs(
                numLits,
                context,
                knightMoves,
                (v0, v1) => v0 === v1,
            );
        }
        return numLits;
    },

    king(numLits: number, element: schema.BooleanElement, context: Context): number {
        if (element.value) {
            numLits = encodeGlobalCellPairs(
                numLits,
                context,
                kingMoves,
                (v0, v1) => v0 === v1,
            );
        }
        return numLits;
    },

    consecutive(numLits: number, element: schema.ConsecutiveElement, context: Context): number {
        if (element.value) {
            const isConsecutiveFunc = (v0: number, v1: number) => Math.abs(v0 - v1) === 1;

            if (element.value.diag) {
                numLits = encodeGlobalCellPairs(numLits, context, kingMoves, isConsecutiveFunc);
            }
            if (element.value.orth) {
                numLits = encodeGlobalCellPairs(numLits, context, getOrthogonallyAdjacentPairs, isConsecutiveFunc);
            }
        }
        return numLits;
    },

    antiX(numLits: number, element: schema.BooleanElement, context: Context): number {
        if (element.value) {
            numLits = encodeGlobalCellPairs(
                numLits,
                context,
                getOrthogonallyAdjacentPairs,
                (v0, v1) => (v0 + v1) === 10,
            );
        }
        return numLits;
    },

    antiV(numLits: number, element: schema.BooleanElement, context: Context): number {
        if (element.value) {
            numLits = encodeGlobalCellPairs(
                numLits,
                context,
                getOrthogonallyAdjacentPairs,
                (v0, v1) => (v0 + v1) === 5,
            );
        }
        return numLits;
    },

    diagonal(numLits: number, element: schema.DiagonalElement, context: Context): number {
        if (element.value) {
            if (element.value.positive) {
                const cellCoords = getMajorDiagonal(true, context.grid);
                numLits = encodeNoRepeats(numLits, cellCoords, context);
            }
            if (element.value.negative) {
                const cellCoords = getMajorDiagonal(false, context.grid);
                numLits = encodeNoRepeats(numLits, cellCoords, context);
            }
        }
        return numLits;
    },

    even(numLits: number, element: schema.RegionElement, context: Context): number {
        const cellCoords = idxMapToKeysArray(element.value || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
        return encodeExcludeValues(numLits, cellCoords, v => 1 === (v + 1) % 2, context);
    },

    odd(numLits: number, element: schema.RegionElement, context: Context): number {
        const cellCoords = idxMapToKeysArray(element.value || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
        return encodeExcludeValues(numLits, cellCoords, v => 0 === (v + 1) % 2, context);
    },

    min(numLits: number, element: schema.RegionElement, context: Context): number {
        const cellIdxes = idxMapToKeysArray(element.value || {});
        for (const [ inIdx, outIdx ] of getBorderCellPairs(cellIdxes, context.grid)) {
            const inCoord  = cellIdx2cellCoord(inIdx,  context.grid);
            const outCoord = cellIdx2cellCoord(outIdx, context.grid);
            // IN < OUT.
            numLits = encodeIncreasing(numLits, [ inCoord, outCoord ], true, context);
        }
        return numLits;
    },
    max(numLits: number, element: schema.RegionElement, context: Context): number {
        const cellIdxes = idxMapToKeysArray(element.value || {});
        for (const [ inIdx, outIdx ] of getBorderCellPairs(cellIdxes, context.grid)) {
            const inCoord  = cellIdx2cellCoord(inIdx,  context.grid);
            const outCoord = cellIdx2cellCoord(outIdx, context.grid);
            // OUT < IN.
            numLits = encodeIncreasing(numLits, [ outCoord, inCoord ], true, context);
        }
        return numLits;
    },

    killer(numLits: number, element: schema.KillerElement, context: Context): number {
        for (const { sum, cells } of Object.values(element.value || {})) {
            const cellCoords = idxMapToKeysArray(cells || {}).map(idx => cellIdx2cellCoord(+idx, context.grid));

            // Cage no repeats.
            numLits = encodeNoRepeats(numLits, cellCoords, context);

            // Cage sum.
            if ('number' === typeof sum) {
                numLits = encodeSum(numLits, sum, cellCoords, context);
            }
        }
        return numLits;
    },

    littleKiller(numLits: number, element: schema.LittleKillerElement, context: Context): number {
        for (const [ diagIdx, sum ] of Object.entries(element.value || {})) {
            if ('number' !== typeof sum) continue;

            const cellCoords = diagonalIdx2diagonalCellCoords(+diagIdx, context.grid);
            numLits = encodeSum(numLits, sum, cellCoords, context);
        }
        return numLits;
    },

    clone(numLits: number, element: schema.CloneElement, context: Context): number {
        for (const { a, b } of Object.values(element.value || {})) {
            if (null == a || null == b) continue;

            const cellCoordsA = arrayObj2array(a).map(idx => cellIdx2cellCoord(idx, context.grid));
            const cellCoordsB = arrayObj2array(b).map(idx => cellIdx2cellCoord(idx, context.grid));
            if (cellCoordsA.length !== cellCoordsB.length) {
                console.error(`Clone element has two different lengths (${cellCoordsA.length} !== ${cellCoordsB.length})`);
                continue;
            }

            numLits = encodeClones(numLits, cellCoordsA, cellCoordsB, context);
        }
        return numLits;
    },

    thermo(numLits: number, element: schema.LineElement, context: Context): number {
        for (const thermoCells of Object.values(element.value || {})) {
            const cellCoords = arrayObj2array(thermoCells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
            numLits = encodeIncreasing(numLits, cellCoords, true, context);
        }
        return numLits;
    },

    slowThermo(numLits: number, element: schema.LineElement, context: Context): number {
        for (const slowThermoCells of Object.values(element.value || {})) {
            const cellCoords = arrayObj2array(slowThermoCells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
            numLits = encodeIncreasing(numLits, cellCoords, false, context);
        }
        return numLits;
    },

    whisper(numLits: number, element: schema.LineElement, context: Context): number {
        return whisperConstraint(
            (gridWidth) => (gridWidth + 1) >> 1,
            numLits,
            element,
            context,
        );
    },

    dutchWhisper(numLits: number, element: schema.LineElement, context: Context): number {
        return whisperConstraint(
            (gridWidth) => ((gridWidth + 1) >> 1) - 1,
            numLits,
            element,
            context,
        );
    },

    renban(numLits: number, element: schema.LineElement, context: Context): number {
        for (const renbanCells of Object.values(element.value || {})) {
            const cellCoords = arrayObj2array(renbanCells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
            if (0 >= cellCoords.length) continue;

            // 1: Ensure that no cell is included multiple times.
            const uniqueCoords = cellCoords.filter(
                (n,i, arr) => {
                    return arr.findIndex(
                        t => {
                            if (n === t)
                                return true;
                            return n[0] === t[0] && n[1] === t[1];
                        }) === i;
                })

            // 2: Encode no repeats.
            numLits = encodeNoRepeats(numLits, uniqueCoords, context);

            // 3: CREATE LITERALS to mark if V is in the region.
            const isVInRegion = Array<void>(context.size).fill().map(() => ++numLits);
            for (const [ v ] of product(context.size)) {
                // Forward: if isVInRegion then some cell must contain v.
                const forwardClause = [ -isVInRegion[v] ];

                for (const [ x, y ] of uniqueCoords) {
                    const cellIsV = context.getLiteral(y, x, v);
                    // Backward: if some cell contains v, then isVInRegion is true.
                    context.clauses.push([ -cellIsV, isVInRegion[v] ]);

                    forwardClause.push(cellIsV);
                }
                context.clauses.push(forwardClause);
            }

            // 4: For all SMALL < MEDIUM < LARGE:
            // If both SMALL and LARGE are in the region then MEDIUM is in the region.
            for (let large = 2; large < context.size; large++) {
                for (let medium = 1; medium < large; medium++) {
                    for (let small = 0; small < medium; small++) {
                        // S & L => M
                        context.clauses.push([ -isVInRegion[small], -isVInRegion[large], isVInRegion[medium] ]);
                    }
                }
            }
        }
        return numLits;
    },

    palindrome(numLits: number, element: schema.LineElement, context: Context): number {
        for (const cells of Object.values(element.value || {})) {
            const cellCoords = arrayObj2array(cells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));

            const cellCoordsA = cellCoords.slice(0, cellCoords.length >> 1);
            const cellCoordsB = cellCoords.slice(-cellCoordsA.length);
            cellCoordsB.reverse();

            numLits = encodeClones(numLits, cellCoordsA, cellCoordsB, context);
        }
        return numLits;
    },

    between(numLits: number, element: schema.LineElement, context: Context): number {
        for (const cells of Object.values(element.value || {})) {
            const betweenCells = arrayObj2array(cells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
            if (3 > betweenCells.length) continue;

            const isAscendingLit = ++numLits;
            const [ headX, headY ] = betweenCells.shift()!;
            const [ tailX, tailY ] = betweenCells.pop()!;

            for (const [ betwX, betwY ] of betweenCells) {
                for (let large = 0; large < context.size; large++) {
                    for (let small = 0; small <= large; small++) {
                        // Using De Morgan's law.
                        context.clauses.push(
                            // Cannot be ASCENDING  & HEAD >= BETW
                            [ -isAscendingLit, -context.getLiteral(headY, headX, large), -context.getLiteral(betwY, betwX, small) ],
                            // Cannot be ASCENDING  & BETW >= TAIL
                            [ -isAscendingLit, -context.getLiteral(betwY, betwX, large), -context.getLiteral(tailY, tailX, small) ],
                            // Cannot be DESCENDING & HEAD <= BETW.
                            [  isAscendingLit, -context.getLiteral(headY, headX, small), -context.getLiteral(betwY, betwX, large) ],
                            // Cannot be DESCENDING & BETW <= TAIL.
                            [  isAscendingLit, -context.getLiteral(betwY, betwX, small), -context.getLiteral(tailY, tailX, large) ],
                        );
                    }
                }
            }
        }
        return numLits;
    },

    doubleArrow(numLits: number, element: schema.LineElement, context: Context): number {
        for (const cells of Object.values(element.value || {})) {
            const lineCells = arrayObj2array(cells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
            if (3 > lineCells.length) continue;

            const head = lineCells.shift()!;
            const tail = lineCells.pop()!;

            const weights: number[] = [];
            const lits: number[] = [];

            // Double arrow circles
            for (const [x, y] of [head, tail]) {
                for (const [ v ] of product(context.size)) {
                    const bulbDigitLiteral = context.getLiteral(y, x, v);
                    const value = 1 + v;
                    weights.push(-1 * value);
                    lits.push(bulbDigitLiteral);
                }
            }

            // Arrow body
            writeSum(lineCells, context, weights, lits); // Write weights into existing arrays.

            // Set -HEAD + BODY = 0;
            numLits = context.pbLib.encodeBoth(weights, lits, 0, 0, context.clauses, 1 + numLits);
        }
        return numLits;
    },

    lockout(numLits: number, element: schema.LineElement, context: Context): number {
        const delta = ((context.size + 1) >> 1) - 1; // TODO: make this configurable somehow.

        for (const cells of Object.values(element.value || {})) {
            const lineCells = arrayObj2array(cells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));

            const [ headX, headY ] = lineCells.shift()!;
            const [ tailX, tailY ] = lineCells.pop()!;

            for (const [ lineX, lineY ] of lineCells) {
                for (let large = 0; large < context.size; large++) {
                    for (let medium = 0; medium <= large; medium++) {
                        for (let small = 0; small <= medium; small++) {
                            context.clauses.push(
                                // Cannot be HEAD >= LINE >= TAIL
                                [-context.getLiteral(headY, headX, large), -context.getLiteral(lineY, lineX, medium), -context.getLiteral(tailY, tailX, small)],
                                // Cannot be TAIL >= LINE >= HEAD
                                [-context.getLiteral(tailY, tailX, large), -context.getLiteral(lineY, lineX, medium), -context.getLiteral(headY, headX, small)],
                            );
                        }
                    }
                }
            }

            for (const [ v0, v1 ] of product(context.size, context.size)) {
                if (Math.abs(v0 - v1) < delta) { // If the difference is too small, we can't have both.
                    const lit0 = context.getLiteral(headY, headX, v0);
                    const lit1 = context.getLiteral(tailY, tailX, v1);
                    context.clauses.push([ -lit0, -lit1 ]);
                }
            }
        }
        return numLits;
    },

    arrow(numLits: number, element: schema.ArrowElement, context: Context): number {
        for (const { bulb, body } of Object.values(element.value || {})) {
            // Arrow only has a bulb
            if (null == body) continue;

            // Reverse so least significant digit first.
            const bulbArrReversed = arrayObj2array(bulb);
            bulbArrReversed.reverse();
            // Discard start (which is on cell head).
            const [ _bodyStart, ...bodyArrRest ] = arrayObj2array(body);
            if (0 >= bulbArrReversed.length || 0 >= bodyArrRest.length) continue;

            const weights: number[] = [];
            const lits: number[] = [];

            // Arrow bulb -- do in reverse order to handle ones place first.
            {
                let power = 1;
                for (const bulbCellIdx of bulbArrReversed) {
                    const [ x, y ] = cellIdx2cellCoord(bulbCellIdx, context.grid);
                    for (const [ v ] of product(context.size)) {
                        const bulbDigitLiteral = context.getLiteral(y, x, v);
                        const value = 1 + v;
                        weights.push(-1 * power * value);
                        lits.push(bulbDigitLiteral);
                    }
                    power *= 10;
                }
            }

            // Arrow body.
            {
                const cellCoords = bodyArrRest.map(idx => cellIdx2cellCoord(idx, context.grid));
                writeSum(cellCoords, context, weights, lits); // Write weights into existing arrays.
            }

            // Set -HEAD + BODY = 0;
            numLits = context.pbLib.encodeBoth(weights, lits, 0, 0, context.clauses, 1 + numLits);
        }
        return numLits;
    },

    xv(numLits: number, element: schema.EdgeNumberElement, context: Context): number {
        for (const [ edgeIdx, sum ] of Object.entries(element.value || {})) {
            if ('number' !== typeof sum) continue;

            const cellPair = edgeIdx2cellIdxes(+edgeIdx, context.grid).map(idx => cellIdx2cellCoord(idx, context.grid));
            numLits = encodeSum(numLits, sum, cellPair, context);
        }
        return numLits;
    },

    difference(numLits: number, element: schema.EdgeNumberElement, context: Context): number {
        const DEFAULT_DELTA = 1;
        for (const [ edgeIdx, deltaOrTrue ] of Object.entries(element.value || {})) {
            const delta = ('number' === typeof deltaOrTrue) ? deltaOrTrue : DEFAULT_DELTA;

            const [ cellIdxA, cellIdxB ] = edgeIdx2cellIdxes(+edgeIdx, context.grid);
            const [ xA, yA ] = cellIdx2cellCoord(cellIdxA, context.grid);
            const [ xB, yB ] = cellIdx2cellCoord(cellIdxB, context.grid);

            for (const [ v ] of product(context.size)) {
                // Cell A is V implies cell B is V - DIFF or V + DIFF.
                // Cell B is V implies cell A is V - DIFF or V + DIFF.
                const aIsVClause = [ -context.getLiteral(yA, xA, v) ];
                const bIsVClause = [ -context.getLiteral(yB, xB, v) ];
                if (delta <= v) {
                    aIsVClause.push(context.getLiteral(yB, xB, v - delta));
                    bIsVClause.push(context.getLiteral(yA, xA, v - delta));
                }
                if (v < context.size - delta) {
                    aIsVClause.push(context.getLiteral(yB, xB, v + delta));
                    bIsVClause.push(context.getLiteral(yA, xA, v + delta));
                }
                context.clauses.push(aIsVClause);
                context.clauses.push(bIsVClause);
            }
        }
        return numLits;
    },

    ratio(numLits: number, element: schema.EdgeNumberElement, context: Context): number {
        const DEFAULT_RATIO = 2;
        for (const [ edgeIdx, ratioOrTrue ] of Object.entries(element.value || {})) {
            const ratio = ('number' === typeof ratioOrTrue) ? ratioOrTrue : DEFAULT_RATIO;
            if (ratio <= 0) throw Error(`Ratio must be positive: ${ratio}.`);

            const [ cellIdxA, cellIdxB ] = edgeIdx2cellIdxes(+edgeIdx, context.grid);
            const [ xA, yA ] = cellIdx2cellCoord(cellIdxA, context.grid);
            const [ xB, yB ] = cellIdx2cellCoord(cellIdxB, context.grid);

            for (const [ v ] of product(context.size)) {
                const value = 1 + v;
                const valueDiv = value / ratio;
                const valueMul = value * ratio;
                // Cell A is VALUE implies cell B is VALUE * DELTA or VALUE / DELTA.
                // Cell B is VALUE implies cell A is VALUE * DELTA or VALUE / DELTA.
                const aIsVClause = [ -context.getLiteral(yA, xA, v) ];
                const bIsVClause = [ -context.getLiteral(yB, xB, v) ];
                if (Number.isInteger(valueDiv)) {
                    aIsVClause.push(context.getLiteral(yB, xB, valueDiv - 1)); // -1 for zero-indexing.
                    bIsVClause.push(context.getLiteral(yA, xA, valueDiv - 1));
                }
                if (Number.isInteger(valueMul) && valueMul <= context.size) {
                    aIsVClause.push(context.getLiteral(yB, xB, valueMul - 1));
                    bIsVClause.push(context.getLiteral(yA, xA, valueMul - 1));
                }
                context.clauses.push(aIsVClause);
                context.clauses.push(bIsVClause);
            }
        }
        return numLits;
    },

    quadruple(numLits: number, element: schema.QuadrupleElement, context: Context): number {
        for (const [ cornerIdx, values ] of Object.entries(element.value || {})) {
            const cellCoords = cornerCoord2cellCoords(cornerIdx2cornerCoord(+cornerIdx, context.grid), context.grid);
            const vs = arrayObj2array(values as ArrayObj<number>).map(value1 => value1 - 1);
            numLits = encodeCellsMustContain(numLits, cellCoords, vs, context);
        }
        return numLits;
    },

    sandwich(numLits: number, element: schema.SeriesNumberElement, context: Context): number {
        // Helper to avoid creating duplicate bread marker variables.
        const _breadLitTable = new Map();
        function getBreadLit(coord: Coord<Geometry.CELL>): number {
            const idx = cellCoord2CellIdx(coord, context.grid);
            let isBreadLit = _breadLitTable.get(idx);
            if (null == isBreadLit) {
                isBreadLit = ++numLits;
                _breadLitTable.set(idx, isBreadLit);

                const [ x, y ] = cellIdx2cellCoord(idx, context.grid);
                const cellIsMin = context.getLiteral(y, x, 0);
                const cellIsMax = context.getLiteral(y, x, context.size - 1);
                // Cell is min => is bread.
                context.clauses.push([ -cellIsMin, isBreadLit ]);
                // Cell is max => is bread.
                context.clauses.push([ -cellIsMax, isBreadLit ]);
                // Cell is bread => is min or is max.
                context.clauses.push([ -isBreadLit, cellIsMin, cellIsMax ]);
            }
            return isBreadLit;
        }

        for (const [ seriesIdx, sandwichSumOrTrue ] of Object.entries(element.value || {})) {
            if ('number' !== typeof sandwichSumOrTrue) continue;

            const cellCoords = seriesIdx2CellCoords(+seriesIdx, context.grid);

            // 1: CREATE LITERALS to mark if a cell is bread (1 or size - 1).
            const isBreadLits = cellCoords.map(getBreadLit);

            // 2: For each possible pair of bread cells, encode a sum (kinda inefficient).
            for (let last = 1; last < context.size; last++) {
                for (let frst = 0; frst < last; frst++) {
                    const weights: number[] = [];
                    const literals: number[] = [];
                    for (let i = frst + 1; i < last; i++) {
                        const [ x, y ] = cellCoords[i];
                        // Skip 1 and 9 (max).
                        for (let v = 1; v < context.size - 1; v++) {
                            const value = 1 + v;
                            weights.push(value)
                            literals.push(context.getLiteral(y, x, v));
                        }
                    }
                    // Encode sum.
                    const sumClauses: number[][] = [];
                    numLits = context.pbLib.encodeBoth(weights, literals, sandwichSumOrTrue, sandwichSumOrTrue, sumClauses, 1 + numLits);
                    // Sum only need be true if this is where the bread is.
                    makeConditional([ isBreadLits[frst], isBreadLits[last] ], sumClauses);
                    context.clauses.push(...sumClauses);
                }
            }
        }
        return numLits;
    },

    xsum(numLits: number, element: schema.SeriesNumberElement, context: Context): number {
        for (const [ seriesIdx, xsumOrTrue ] of Object.entries(element.value || {})) {
            if ('number' !== typeof xsumOrTrue) continue;

            const [ xCellCoord, ...restCellCoords ] = seriesIdx2CellCoords(+seriesIdx, context.grid);
            const [ x, y ] = xCellCoord;

            // Deal with xSum = 1 separately:
            if (1 === xsumOrTrue) {
                // xCell must be 1.
                context.clauses.push([ context.getLiteral(y, x, 0) ]);
                continue;
            }
            // xCell must not be 1. Important so the remaining clauses get triggered.
            context.clauses.push([ -context.getLiteral(y, x, 0) ]);

            for (let xv = 1; xv < context.size; xv++) {
                const sumCellCoords = restCellCoords.slice(0, xv);
                const xValue = 1 + xv;
                const xCellLit = context.getLiteral(y, x, xv);

                const prevNumClauses = context.clauses.length;
                numLits = encodeSum(numLits, xsumOrTrue - xValue, sumCellCoords, context);
                makeConditional([ xCellLit ], context.clauses.slice(prevNumClauses));
            }
        }
        return numLits;
    },

    skyscraper(numLits: number, element: schema.SeriesNumberElement, context: Context): number {
        for (const [ seriesIdx, numVisible ] of Object.entries(element.value || {})) {
            if ('number' !== typeof numVisible) continue;

            const cellCoords = seriesIdx2CellCoords(+seriesIdx, context.grid);

            // 1: CREATE LITERALS to mark if a cell is visible. Skip the first one (always visible).
            const isVisibleLits = Array<void>(context.size - 1).fill().map(() => ++numLits);
            for (let i = 1; i < context.size; i++) {
                const [ x, y ] = cellCoords[i];

                for (let v = 0; v < context.size; v++) {
                    const cellIsVLit = context.getLiteral(y, x, v);
                    const cellIsVisible = isVisibleLits[i - 1];

                    // This cell being NOT visible implies some previous cells is greater.
                    const notVisibleClause = [ -cellIsVLit, cellIsVisible ];
                    context.clauses.push(notVisibleClause);

                    for (let iPrev = 0; iPrev < i; iPrev++) {
                        for (let gtV = v + 1; gtV < context.size; gtV++) {
                            // Any previous cell greater implies this is NOT visible.
                            const [ xPrev, yPrev ] = cellCoords[iPrev];
                            const prevCellGtLit = context.getLiteral(yPrev, xPrev, gtV);
                            // Cell is v AND prev cell is gtV implies cell not visible.
                            context.clauses.push([ -cellIsVLit, -prevCellGtLit, -cellIsVisible ]);

                            notVisibleClause.push(prevCellGtLit);
                        }
                    }
                }
            }

            // 2: Number visible must add up to the clue (first cell is ignored).
            const ones = Array(isVisibleLits.length).fill(1);
            numLits = context.pbLib.encodeBoth(ones, isVisibleLits, numVisible - 1, numVisible - 1, context.clauses, 1 + numLits);
        }
        return numLits;
    },

    columnIndexer(numLits: number, element: schema.RegionElement, context: Context): number {
        const cellCoords = idxMapToKeysArray(element.value || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
        for (const [ c, r ] of cellCoords) {
            for (const [ v ] of product(context.size)) {
                const indexer = context.getLiteral(r, c, v);
                const indexee = context.getLiteral(r, v, c);
                context.clauses.push(
                    [ -indexer, indexee ],
                    [ -indexee, indexer ],
                );
            }
        }
        return numLits;
    },
} as const;

/**
 * Modifies the CLAUSES in-place such that they only need be satisfied if ALL of the CONDITION_CONJUNCTION literals are true.
 * AKA the CONDITION_CONJUNCTION _implies_ the CLAUSES.
 * @param conditionConjunction If any of the condition literals are false, the clauses need not be satisfied.
 * @param clauses The existing clauses, to be modified in place.
 */
function makeConditional(conditionConjunction: number[], clauses: number[][]): void {
    for (const clause of clauses) {
        for (const conditionLiteral of conditionConjunction) {
            clause.push(-conditionLiteral);
        }
    }
}

function encodeClones(numLits: number, cellsA: Coord<Geometry.CELL>[], cellsB: Coord<Geometry.CELL>[], context: Context): number {
    if (cellsA.length !== cellsB.length) throw Error(`Cloned cells must be of equal length (${cellsA.length} !== ${cellsB.length}).`);
    for (let i = 0; i < cellsA.length; i++) {
        const [ xA, yA ] = cellsA[i];
        const [ xB, yB ] = cellsB[i];
        for (const [ v ] of product(context.size)) {
            const litA = context.getLiteral(yA, xA, v);
            const litB = context.getLiteral(yB, xB, v);
            context.clauses.push(
                // A implies B.
                [ -litA, litB ],
                // B implies A.
                [ -litB, litA ],
            );

        }
    }
    return numLits;
}

/**
 * Encodes that CELLS should be increasing.
 * If STRICT is false, encodes that CELLS should be nondecreasing.
 * If STRICT is true, encodes that cells should be strictly increasing.
 */
function encodeIncreasing(numLits: number, cells: Coord<Geometry.CELL>[], strict: boolean, context: Context): number {
    for (let i = 1; i < cells.length; i++) {
        const [ prevX, prevY ] = cells[i - 1];
        const [ nextX, nextY ] = cells[i];
        for (let large = 0; large < context.size; large++) {
            for (let small = 0; small <= large; small++) {
                // Dont add exclusion of equality if we're not strict.
                if (!strict && small === large) continue;

                const largePrevLit = context.getLiteral(prevY, prevX, large);
                const smallNextLit = context.getLiteral(nextY, nextX, small);
                // Prevent large preceding small.
                context.clauses.push([ -largePrevLit, -smallNextLit ]);
            }
        }
    }
    return numLits; // Unchanged.
}

function encodeCellsMustContain(numLits: number, cells: Coord<Geometry.CELL>[], vs: number[], context: Context): number {
    const valueOccurrences = new Map<number, number>();
    for (const v of vs) {
        valueOccurrences.set(v, 1 + (valueOccurrences.get(v) || 0));
    }

    for (const [ v, occurrences ] of valueOccurrences) {
        const literals = writeLitsV(cells, +v, context);
        numLits = context.pbLib.encodeAtLeastK(literals, occurrences, context.clauses, 1 + numLits);
    }

    return numLits;
}

function encodeNoRepeats(numLits: number, cells: Coord<Geometry.CELL>[], context: Context): number {
    if (context.size < cells.length) {
        context.clauses.push([]);
        return numLits;
    }
    for (const [ v ] of product(context.size)) {
        const literals = writeLitsV(cells, v, context);
        numLits = context.pbLib.encodeAtMostK(literals, 1, context.clauses, 1 + numLits);
    }
    return numLits;
}

function writeLitsV(cells: Coord<Geometry.CELL>[], v: number, context: Context, literals: number[] = []): number[] {
    for (const [ x, y ] of cells) {
        const literal = context.getLiteral(y, x, v);
        literals.push(literal);
    }
    return literals;
}

function encodeSum(numLits: number, sum: number, cells: Coord<Geometry.CELL>[], context: Context): number {
    const [ weights, lits ] = writeSum(cells, context);
    return context.pbLib.encodeBoth(weights, lits, sum, sum, context.clauses, 1 + numLits);
}

function writeSum(cells: Coord<Geometry.CELL>[], context: Context, weights: number[] = [], literals: number[] = []): [ weights: number[], literals: number[] ] {
    for (const [ x, y ] of cells) {
        for (const [ v ] of product(context.size)) {
            const value = 1 + v;
            const literal = context.getLiteral(y, x, v);
            weights.push(value);
            literals.push(literal);
        }
    }
    return [ weights, literals ];
}

function encodeGlobalCellPairs(
    numLits: number,
    context: Context, cellPairsFunc: typeof knightMoves,
    constraintFunc: (v0: number, v1: number) => boolean
): number {
    for (const [ [ x0, y0 ], [ x1, y1 ] ] of cellPairsFunc(context.grid)) {
        for (const [ v0, v1 ] of product(context.size, context.size)) {
            if (constraintFunc(v0 + 1, v1 + 1)) {
                const aLit = context.getLiteral(y0, x0, v0);
                const bLit = context.getLiteral(y1, x1, v1);
                context.clauses.push([ -aLit, -bLit ]); // Cannot both be true.
            }
        }
    }
    return numLits;
}

function encodeExcludeValues(numLits: number, cells: Coord<Geometry.CELL>[], excludeValues: (v: number) => boolean, context: Context): number {
    for (const [ x, y ] of cells) {
        for (const [ v ] of product(context.size)) {
            if (excludeValues(v)) {
                const literal = context.getLiteral(y, x, v);
                context.clauses.push([ -literal ]);
            }
        }
    }
    return numLits;
}

function whisperConstraint(deltaFunc: (gridWidth: number) => number, numLits: number, element: schema.LineElement, context: Context) {
    const delta = deltaFunc(context.size); // TODO: make this configurable somehow.

    for (const whisperCells of Object.values(element.value || {})) {
        const cellCoords = arrayObj2array(whisperCells || {}).map(idx => cellIdx2cellCoord(idx, context.grid));
        for (let i = 1; i < cellCoords.length; i++) {
            const [ x0, y0 ] = cellCoords[i - 1];
            const [ x1, y1 ] = cellCoords[i];

            for (const [ v0, v1 ] of product(context.size, context.size)) {
                if (Math.abs(v0 - v1) < delta) { // If the difference is too small, we can't have both.
                    const lit0 = context.getLiteral(y0, x0, v0);
                    const lit1 = context.getLiteral(y1, x1, v1);
                    context.clauses.push([ -lit0, -lit1 ]);
                }
            }
        }
    }
    return numLits;
}
