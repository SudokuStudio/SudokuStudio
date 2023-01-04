import { StateManager, StateRef } from '@sudoku-studio/state-manager';
import type { schema } from "@sudoku-studio/schema";

export const MARK_TYPES = [
    'filled', 'corner', 'center', 'colors',
] as const;

export const userState = (window as any).userState = new StateManager();
userState.update({
    select: {},
    cursor: {
        index: null,
        isShown: false,
    },

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

export function getUserToolStateName(toolState: StateRef | null): string | null {
    switch (toolState) {
        case userState.get('marks', 'filled'):
            return 'filled';
        case userState.get('marks', 'corner'):
            return 'corner';
        case userState.get('marks', 'center'):
            return 'center';
        case userState.get('marks', 'colors'):
            return 'colors';
        default:
            return null;
    }
}

export const userSelectState = userState.ref('select');
export const userCursorIndexState = userState.ref('cursor', 'index');
export const userCursorIsShownState = userState.ref('cursor', 'isShown');

export const userPrevToolState = userState.ref('prevTool');
export const userToolState = userState.ref('tool');
export const TOOL_INPUT_NAME = 'tool';

/** Load tools and pencil marks for the user. */
export function setupUserState(board: schema.Board) {
    for (const [ id, { type }] of Object.entries(board.elements)) {
        if ((MARK_TYPES as readonly string[]).includes(type)) {
            userState.ref('marks', type).replace(id);
            if ('filled' === type) {
                userState.ref('tool').replace(id);
                userState.ref('prevTool').replace(id);
            }
        }
    }
}
