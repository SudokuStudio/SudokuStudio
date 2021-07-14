import { StateManager } from "@sudoku-studio/state-manager";

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {},
    tool: '10140' // TODO magic number.
});

export const userSelectState = userState.ref('select');

export const toolState = userState.ref('tool');
export const TOOL_INPUT_NAME = 'tool';
