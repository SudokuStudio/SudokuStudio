// https://github.com/zemax/node-sass-svg/blob/master/svg-function.js
import path from 'path';
import fs from 'fs';
import { types } from 'sass';

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

export default function inlineSvg(svgPath) {
    svgPath = path.resolve('src', svgPath.getValue());
    if (!fs.statSync(svgPath).isFile()) throw Error(`Could not find file ${svgPath}.`);
    const encodedSvg = encodeSvg(fs.readFileSync(svgPath, 'utf8'));
    return new types.String(`url("data:image/svg+xml,${encodedSvg}")`);
}
