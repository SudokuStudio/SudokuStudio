import { StateManager } from '@sudoku-studio/state-manager';

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {},
    tool: '120', // TODO magic numbers.
    marks: {
        filled: '120', // TODO magic numbers.
        corner: '130',
        center: '140',
        colors: '150',
    },
});

export const userSelectState = userState.ref('select');

export const toolState = userState.ref('tool');
export const TOOL_INPUT_NAME = 'tool';
