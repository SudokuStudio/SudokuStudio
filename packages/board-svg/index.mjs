import { JSDOM } from "jsdom";
import { Board } from "@sudoku-studio/board";
import { StateManager } from "@sudoku-studio/state-manager";
import { promisify } from "util";
import fs from "fs";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

if (process.argv.length <= 2 || 4 < process.argv.length) {
    console.error(`Usage: ${process.argv[0]} ${process.argv[1]} INPUT_JSON_FILE [OUTPUT_SVG_FILE]`);
    process.exit(1);
}

const input = readFile(process.argv[2], 'utf-8');
const outputFile = process.argv[3] || process.stdout.fd;


const dom = new JSDOM('', { url: "http://localhost/" });
Object.assign(global, dom.window);

const boardState = new StateManager();
const userState = new StateManager();

input
    .then(JSON.parse)
    .then(data => boardState.update(data))
    .then(() => {
        new Board({
            target: dom.window.document.body,
            props: { boardState, userState },
        });
    })
    .then(() => writeFile(outputFile, dom.window.document.body.firstElementChild.outerHTML, 'utf-8'), console.error);
