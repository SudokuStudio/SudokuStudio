import { debounce } from "debounce";
import * as LZString from 'lz-string';

import { StateManager } from '@sudoku-studio/state-manager';

export const boardState = (window as any).boardState = new StateManager();
export const filledState = boardState.ref('elements', '120', 'value'); // TODO "120" magic number.
export const thermoState_TEMP = boardState.ref('elements', '10140', 'value'); // TODO

// Setup board.
(() => {
    boardState.watch(debounce((_path, _oldVal, newVal) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('b', LZString.compressToEncodedURIComponent(JSON.stringify(newVal)));
        window.history.replaceState(null, '', newUrl.href);
    }, 200), false, '.');

    const thisUrl = new URL(window.location.href);
    if (thisUrl.searchParams.has('b')) {
        const boardString = thisUrl.searchParams.get('b')!;
        try {
            const json = LZString.decompressFromEncodedURIComponent(boardString);
            if (null != json) {
                boardState.update(JSON.parse(json));
                return;
            }
        }
        catch (e) {
            console.error('Failed to update board from `b` param.');
        }
    }

    boardState.update({
        grid: {
            width: 9,
            height: 9,
        },
        elements: {
            '10': {
                type: 'box',
                order: 10,
                value: {
                    width: 3,
                    height: 3,
                },
            },
            '11': {
                type: 'grid',
                order: 10,
                value: null,
            },
            '10800': {
                type: 'diagonal',
                value: {
                    positive: true,
                    negative: false,
                },
                order: 9.5,
            },
            '10090': {
                type: 'knight',
                value: false,
            },
            '10100': {
                type: 'king',
                value: false,
            },
            '10110': {
                type: 'disjointGroups',
                value: false,
            },
            '10120': {
                type: 'consecutive',
                value: false,
            },

            // LOCALS
            '120': {
                type: 'filled',
                order: 15,
                value: {
                    "8": 8,
                    "26": 5,
                    "30": 7,
                    "45": 1,
                    "47": 2,
                },
            },
            '10130': {
                type: 'given',
                order: 15,
                value: {
                    "12": 3,
                    "13": 4,
                    "39": 4,
                    "40": 1,
                    "64": 3,
                },
            },
            '10140': {
                type: 'thermo',
                order: 3,
                value: {
                    "110": {
                        length: 4,
                        "0": 3,
                        "1": 13,
                        "2": 23,
                    },
                    "120": {
                        length: 4,
                        "0": 29,
                        "1": 20,
                        "2": 21,
                    },
                },
            },
            '10150': {
                type: 'arrow',
                order: 9,
                value: {
                    "110": {
                        "head": {
                            length: 1,
                            "0": 27,
                        },
                        "body": {
                            length: 3,
                            "0": 27, // TODO REMOVE ?
                            "1": 28,
                            "2": 29,
                        },
                    },
                    "120": {
                        "head": {
                            length: 2,
                            "0": 45, // TODO REMOVE ?
                            "1": 46,
                        },
                        "body": {
                            length: 5,
                            "0": 46, // TODO REMOVE ?
                            "1": 47,
                            "2": 56,
                            "3": 66,
                            "4": 57,
                        },
                    },
                },
            },
            '10160': {
                type: 'min',
                order: 2,
                value: {
                    "56": true,
                    "57": true,
                    "63": true,
                    "64": true,
                    "65": true,
                },
            },
            '10170': {
                type: 'max',
                order: 2,
                value: {
                    "58": true,
                    "67": true,
                    "68": true,
                    "77": true,
                },
            },
            '10180': {
                type: 'killer',
                order: 12,
                value: {
                    "150": {
                        sum: 43,
                        cells: {
                            "28": true,
                            "36": true,
                            "37": true,
                            "38": true,
                            "45": true,
                            "47": true,
                            "54": true,
                            "55": true,
                        },
                    },
                    "160": {
                        sum: 18,
                        cells: {
                            "60": true,
                            "61": true,
                            "69": true,
                        },
                    },
                    "170": {
                        sum: 16,
                        cells: {
                            "71": true,
                            "79": true,
                            "80": true,
                        },
                    },
                },
            },
            '10190': {
                type: 'quadruple',
                order: 11,
                value: {
                    "12": {
                        length: 3,
                        "0": 1,
                        "1": 5,
                        "2": 9,
                    },
                    "24": {
                        length: 2,
                        "0": 8,
                        "1": 9,
                    },
                    "66": {
                        length: 4,
                        "0": 1,
                        "1": 1,
                        "2": 2,
                        "3": 2,
                    },
                },
            },
        },
    });
})();
