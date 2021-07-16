import { StateManager } from '@sudoku-studio/state-manager';

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {},
    cursor: null,

    tool: '120', // TODO magic numbers.
    prevTool: '120',
    marks: {
        filled: '120', // TODO magic numbers.
        corner: '130',
        center: '140',
        colors: '150',
    },
    history: {},
    historyUndone: {},
});

export const userSelectState = userState.ref('select');
export const userCursorState = userState.ref('cursor');

export const userPrevToolState = userState.ref('prevTool');
export const userToolState = userState.ref('tool');
export const TOOL_INPUT_NAME = 'tool';
