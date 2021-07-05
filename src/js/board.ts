import { writable } from 'svelte/store';



export const globalConstraints = writable([
    {
        id: "10080",
        name: 'Diagonals',
        icons: [ 'positive-diagonal', 'negative-diagonal' ],
        state: [ true, false ],
    },
    {
        id: "10090",
        name: 'Antiknight',
        icons: [ 'knight' ],
        state: [ false ],
    },
    {
        id: "10090",
        name: 'Antiking',
        icons: [ 'king' ],
        state: [ false ],
    },
    {
        id: "10090",
        name: 'Antiking',
        icons: [ 'king' ],
        state: [ false ],
    }
]);
