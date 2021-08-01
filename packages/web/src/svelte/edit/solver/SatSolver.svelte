<script lang="ts">
    import { debounce } from "debounce";
    import type { schema } from "@sudoku-studio/schema";
    import { boardState } from "../../../js/board";
    import { SatSolver } from "../../../js/solver/satSolver";
    import { solutionToString } from "@sudoku-studio/board-utils";

    const MAX_SOLUTIONS = 10; // TODO.

    let autoRun = false;
    let solutions: null | number = null;
    let running = false;
    let cancelFn: null | (() => Promise<boolean>) = null;

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

    boardState.watch(debounce(async (_path, _oldData, _newData) => {
        if (autoRun) {
            const success = await cancelRun();
            if (success) {
                await run();
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
        const cannotAttempt = await SatSolver.cannotAttempt(board);
        if (cannotAttempt) {
            message = 'Cannot solve: ' + cannotAttempt;
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
</script>

<div class="solver-row-container">
    <div class="solver-row">
        {running ? 'Running...' : 'Idle'}
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