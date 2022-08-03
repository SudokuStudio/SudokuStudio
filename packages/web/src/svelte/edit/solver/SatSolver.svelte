<script lang="ts">
    import { debounce } from "debounce";
    import type { schema, Geometry, IdxMap } from "@sudoku-studio/schema";
    import { boardState, getTypeForElementKey, setCellValue } from "../../../js/board";
    import type { Diff } from "@sudoku-studio/state-manager";
    import { MARK_TYPES } from "../../../js/user";
    import { pushHistoryList } from "../../../js/history";
    import { SatSolver } from "../../../js/solver/satSolver";
    import { solutionToString } from "@sudoku-studio/board-utils";

    const MAX_SOLUTIONS = 10; // TODO.

    let autoRun = false;
    let solutions: null | number = null;
    let running = false;
    let cancelFn: null | (() => Promise<boolean>) = null;

    let trueCandidates = false;
    let trueCandidatesResult: IdxMap<Geometry.CELL, Array<number>> = {};
    let runningTC = false;
    let cancelTCFn: null | (() => Promise<boolean>) = null;

    let message: string = 'Solutions: ?';

    async function buttonClicked() {
        if (running && cancelFn) {
            if (await cancelFn()) {
                running = false;
                cancelFn = null;
            }
        }
        else {
            run();
        }
    }

    async function trueCandidatesToggled(event: Event) {
        const updatedTrueCandidates = (event?.target as HTMLInputElement).checked;
        const success = await cancelRunTrueCandidates();

        if (updatedTrueCandidates) {
            if (success) {
                await runTrueCandidates();
            }
        }
    }

    boardState.watch(debounce(async (path, _oldData, _newData) => {
        const elementType = getTypeForElementKey(path[1]);
        if (MARK_TYPES.some(type => elementType === type)) {
            // Do not run solver for changes to pencil marks
            return;
        }

        if (autoRun) {
            const success = await cancelRun();
            if (success) {
                await run();
            }
        }
        if (trueCandidates) {
            const success = await cancelRunTrueCandidates();
            if (success) {
                await runTrueCandidates();
            }
        }
    }, 500), true, 'elements/*');

    async function cancelRun(): Promise<boolean> {
        if (!running || null == cancelFn)
            return true;

        const success = await cancelFn();
        if (success) {
            running = false;
            cancelFn = null;
        }
        return success;
    }

    async function run(): Promise<void> {
        if (running) return;

        const board = boardState.get<schema.Board>()!;
        const cantAttempt = await SatSolver.cantAttempt(board);
        if (cantAttempt) {
            message = 'Cannot solve: ' + cantAttempt;
            running = false;
            return;
        }

        const START = Date.now();
        running = true;
        solutions = 0;
        message = 'Solutions: ?';

        cancelFn = SatSolver.solve(board, MAX_SOLUTIONS, solution => {
            if (null == solutions) {
                console.warn('solutions null');
                return;
            }

            const timeStr = `${Date.now() - START} ms`;
            if (null == solution) {
                message = `Solutions: ${solutions < MAX_SOLUTIONS ? '' : '≥'}${solutions} (${timeStr})`;
                running = false;
                cancelFn = null;
            }
            else {
                solutions++;
                message = `Solutions: ≥${solutions} (${timeStr})`;
                console.log(`Solution ${solutions}:\n${solutionToString(solution, board.grid)}`);
            }
        });
    }

    async function cancelRunTrueCandidates(): Promise<boolean> {
        if (!runningTC || null == cancelTCFn)
            return true;

        const success = await cancelTCFn();
        if (success) {
            runningTC = false;
            cancelTCFn = null;
        }
        return success;
    }

    async function runTrueCandidates(): Promise<void> {
        if (runningTC) return;

        const board = boardState.get<schema.Board>()!;
        const cantAttempt = await SatSolver.cantAttempt(board);
        if (cantAttempt) {
            message = 'Cannot solve: ' + cantAttempt;
            runningTC = false;
            return;
        }

        runningTC = true;

        cancelTCFn = SatSolver.solveTrueCandidates(board, candidates => {
            if (null == trueCandidatesResult) {
                console.warn('candidates null');
                return;
            }

            if (null != candidates) {
                let diffList: (Diff | null)[] = [];

                for (const [cellIndex, possibleDigits] of Object.entries(candidates)) {
                    if (null == possibleDigits) {
                        continue;
                    }

                    const cellIndexNum = Number(cellIndex);
                    if (possibleDigits.length === 1) {
                        diffList.push(setCellValue('filled', cellIndexNum, possibleDigits[0]));
                        diffList.push(setCellValue('center', cellIndexNum, null));
                    } else {
                        const updatedCenterMarks = possibleDigits.reduce(
                            (accumulator: {[key: number]: boolean}, digit) => {
                                accumulator[digit] = true;
                                return accumulator;
                            },
                            {},
                        );
                        diffList.push(setCellValue('center', cellIndexNum, updatedCenterMarks));
                        diffList.push(setCellValue('filled', cellIndexNum, null));
                    }
                }

                pushHistoryList(diffList);
            }
            runningTC = false;
            cancelTCFn = null;
        });
    }
</script>

<div class="solver-row-container">
    <div class="solver-row">
        {running || runningTC ? 'Running...' : 'Idle'}
    </div>
    <div class="solver-row">
        <input id="sat-solver-truecandidates" type="checkbox" name="truecandidates" on:change={trueCandidatesToggled} bind:checked={trueCandidates} />
        <label for="sat-solver-truecandidates">True Candidates</label>
    </div>
    <div class="solver-row">
        <input id="sat-solver-autorun" type="checkbox" name="autorun" bind:checked={autoRun} />
        <label for="sat-solver-autorun">Auto</label>
        <button style="margin-left: 2em;" on:click={buttonClicked}>{running ? 'Stop' : 'Run'}</button>
    </div>
    <div class="solver-row">
        {message}
    </div>
</div>

<style lang="scss">
    .solver-row-container {
        // TODO: magic values, need to sync with ConstraintRow through vars.
        margin: 0.25em 0 0.5em 1.5em;

        .solver-row {
            padding: 0.25em;
        }
    }
</style>