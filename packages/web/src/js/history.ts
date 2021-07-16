import type { Diff } from "@sudoku-studio/state-manager";
import { boardState } from "./board";
import { userState } from "./user";

export function pushHistory(history: Diff | null): boolean {
    if (!history) return false;
    userState.update({
        [`history/${Date.now()}`]: JSON.stringify(history),
        historyUndone: null,
    });
    return true;
}

export function changeHistory(redo: boolean): boolean {
    const historyObject = userState.get<Record<string, string>>(redo ? 'historyUndone' : 'history') || {};
    const historyTimestampKeys = Object.keys(historyObject);
    if (0 === historyTimestampKeys.length) return false;

    const histKey = historyTimestampKeys.reduce((a, b) => (redo !== (+a > +b)) ? a : b);
    const histVal = historyObject[`${histKey}`];

    // Ignore empty entries (bug).
    if (null == histVal) {
        console.warn('EMPTY HISTORY ENTRY', histKey, histVal);
        userState.update({
            [`${redo ? 'historyUndone' : 'history'}/${histKey}`]: null,
        });
        changeHistory(redo);
    }

    const diffData: Diff = JSON.parse(histVal);
    // Update board changes.
    // TODO: USE OTHER TO RESOLVE CONFLICTS.
    boardState.update(redo ? diffData.redo : diffData.undo);
    // Remove entry from historyUndone.
    // Add entry to history.
    userState.update({
      [`history/${histKey}`]: redo ? histVal : null,
      [`historyUndone/${histKey}`]: redo ? null : histVal,
    });
    return true;
}
(window as any).changeHistory = changeHistory;

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if ('KeyZ' === event.code && event.ctrlKey) {
        changeHistory(event.shiftKey);
    }
    else if ('KeyY' === event.code && event.ctrlKey) {
        changeHistory(true);
    }
    else {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
});
