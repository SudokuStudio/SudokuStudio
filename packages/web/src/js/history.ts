import type { Diff } from "@sudoku-studio/state-manager";
import { boardState } from "./board";
import { userState } from "./user";

export function pushHistory(history: Diff | null): boolean {
    if (!history) return false;
    if (0 === Object.keys(history.redo).length && 0 === Object.keys(history.undo).length) return false;
    userState.update({
        [`history/${Date.now()}`]: JSON.stringify(history),
        historyUndone: null,
    });
    return true;
}

/// Push a list of multiple diffs as a single history element
export function pushHistoryList(historyList: (Diff | null)[]): boolean {
    const combinedDiff: Diff = { undo: {}, redo: {} };

    for (const diff of historyList) {
        if (diff == null) {
            continue;
        }

        Object.assign(combinedDiff.undo, diff.undo);
        Object.assign(combinedDiff.redo, diff.redo);
    }

    return pushHistory(combinedDiff);
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
    if ('KeyZ' === event.code && (event.ctrlKey || event.metaKey)) {
        changeHistory(event.shiftKey);
    }
    else if ('KeyY' === event.code && (event.ctrlKey || event.metaKey)) {
        changeHistory(true);
    }
    else {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
});
