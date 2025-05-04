// https://github.com/zemax/node-sass-svg/blob/master/svg-function.js
import path from 'path';
import fs from 'fs';
import { SassNumber, SassString, Value } from 'sass';

/**
 * Converts the data into an inline-encoded SVG.
 * @param {string} data
 * @returns {string}
 */
function encodeSvg(data) {
    const symbols = /[\r\n"%#()<>?\[\\\]^`{|}]/g;

    // Use single quotes instead of double to avoid encoding.
    if (0 <= data.indexOf('"')) { // TODO this seems like it will break any single quotes in text.
        data = data.replace(/"/g, "'");
    }

    data = data.replace(/>\s{1,}</g, "><");
    data = data.replace(/\s{2,}/g, " ");

    data = data.replace(symbols, encodeURIComponent);

    return data;
}

/**
 * Converts the data into a base64-encoded SVG.
 * @param {Value[]} args
 * @returns {Value}
 */
export function inlineSvg(args) {
    const svgPath = path.resolve('src', args[0].assertString().text);
    if (!fs.statSync(svgPath).isFile()) throw Error(`Could not find file ${svgPath}.`);
    const encodedSvg = encodeSvg(fs.readFileSync(svgPath, 'utf8'));
    return new SassString(`data:image/svg+xml,${encodedSvg}`, { quotes: true });
    // // return `data:image/svg+xml,${encodedSvg}`;
    // // return new SassString(`url("data:image/svg+xml,${encodedSvg}")`, { quotes: false });
    // return new SassString('hello world',  { quotes: false });
}