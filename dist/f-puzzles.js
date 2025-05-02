import * as LZString from "lz-string";
import { boardRepr, cellCoord2CellIdx, svgCoord2diagonalIdx, svgCoord2edgeIdx, roman2num, svgCoord2seriesIdx, cellIdx2cellCoord, svgCoord2cornerCoord, cornerCoord2cornerIdx, gridToBoxSizeMap } from "@sudoku-studio/board-utils/src";
import { hexToHsluv, hsluvToHex } from "hsluv";
const RC_REGEX = /R(\d+)C(\d+)/i;
function parseRCNotation(rc) {
    const match = RC_REGEX.exec(rc);
    if (null == match)
        throw Error(`Failed to parse RC string: ${rc}.`);
    const row = Number(match[1]);
    const col = Number(match[2]);
    const x = col - 1;
    const y = row - 1;
    return [x, y];
}
export function parseFpuzzles(b64, createElement) {
    const json = LZString.decompressFromBase64(b64);
    if (null == json)
        throw Error('Failed to LZString decompress fpuzzles board.');
    const fBoard = JSON.parse(json);
    const size = fBoard.size;
    if (null == size || !(size in gridToBoxSizeMap))
        throw Error(`Unknown size: ${size})`);
    const boxSize = gridToBoxSizeMap[size];
    const board = boardRepr.createNewBoard(createElement, ...boxSize);
    const grid = { width: size, height: size };
    function findOrAddElement(type, value) {
        if (null == board.elements)
            board.elements = {};
        for (const elem of Object.values(board.elements)) {
            if (type === elem.type) {
                if (null != elem.value) {
                    Object.assign(elem.value, value);
                }
                else {
                    elem.value = value;
                }
                return elem;
            }
        }
        const elem = createElement(type, value);
        board.elements[boardRepr.makeUid()] = elem;
        return elem;
    }
    function addRegionElement(type, fRegionConstraint) {
        const elem = findOrAddElement(type, {});
        for (const fRegionObj of fRegionConstraint) {
            const cellIdx = cellCoord2CellIdx(parseRCNotation(fRegionObj.cell), grid);
            elem.value[cellIdx] = true;
        }
    }
    function addLineElement(type, fLinesConstraint) {
        const elem = findOrAddElement(type, {});
        for (const fLinesObj of fLinesConstraint) {
            for (const fLine of fLinesObj.lines) {
                const cellArr = elem.value[boardRepr.makeUid()] = [];
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    cellArr.push(cellIdx);
                }
            }
        }
    }
    function addEdgeElement(type, fLinesConstraint, parse = Number) {
        const elem = findOrAddElement(type, {});
        for (const fCellsObj of fLinesConstraint) {
            if (2 !== fCellsObj.cells.length) {
                console.error('Cannot parse difference not between two cells.');
                continue;
            }
            const coordA = parseRCNotation(fCellsObj.cells[0]);
            const coordB = parseRCNotation(fCellsObj.cells[1]);
            const average = [
                0.5 * (coordA[0] + coordB[0] + 1),
                0.5 * (coordA[1] + coordB[1] + 1),
            ];
            const edgeIdx = svgCoord2edgeIdx(average, grid);
            if (null == edgeIdx) {
                console.error(`Cannot parse difference between two nonadjacent cells: ${fCellsObj.cells.join(', ')}.`);
                continue;
            }
            const val = (null != fCellsObj.value) ? parse(fCellsObj.value) : null;
            elem.value[edgeIdx] = (null != val) ? val : true;
        }
    }
    function addSeriesElement(type, fConstraint) {
        const elem = findOrAddElement(type, {});
        for (const fCellValue of fConstraint) {
            // Find the equivalent click location.
            // Cell is outside the grid.
            const coord = parseRCNotation(fCellValue.cell);
            coord[0] += 0.5;
            coord[1] += 0.5;
            const seriesIdx = svgCoord2seriesIdx(coord, grid);
            if (null == seriesIdx) {
                console.error('Cannot handle this series.', fCellValue);
                continue;
            }
            elem.value[seriesIdx] = (null != fCellValue.value) ? Number(fCellValue.value) : true;
        }
    }
    function addKillerElement(fConstraint) {
        const elem = findOrAddElement('killer', {});
        for (const fKillerEntry of fConstraint) {
            const killerItem = elem.value[boardRepr.makeUid()] = {
                cells: {},
                sum: (null != fKillerEntry.value) ? Number(fKillerEntry.value) : undefined,
            };
            for (const rc of fKillerEntry.cells) {
                const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                killerItem.cells[cellIdx] = true;
            }
        }
    }
    if (fBoard.title)
        board.meta.title = fBoard.title;
    if (fBoard.author)
        board.meta.author = fBoard.author;
    if (fBoard.ruleset)
        board.meta.description = fBoard.ruleset;
    for (let y = 0; y < size; y++) {
        const gridRow = fBoard.grid[y];
        for (let x = 0; x < size; x++) {
            const gridEntry = gridRow[x];
            const cellIdx = cellCoord2CellIdx([x, y], grid);
            if (null != gridEntry.region) {
                let elem;
                elem = findOrAddElement('gridRegion', {});
                const regions = elem.value;
                for (let i = 0; i < size; i++) {
                    if (null != regions[i][cellIdx]) {
                        regions[i][cellIdx] = false;
                    }
                }
                regions[gridEntry.region][cellIdx] = true;
            }
            if (null != gridEntry.value) {
                let elem;
                if (gridEntry.given) {
                    elem = findOrAddElement('givens', {});
                }
                else {
                    elem = findOrAddElement('filled', {});
                }
                elem.value[cellIdx] = gridEntry.value;
            }
            if (gridEntry.cornerPencilMarks) {
                const elem = findOrAddElement('corner', {});
                const cellMarks = elem.value[cellIdx] = {};
                gridEntry.cornerPencilMarks.forEach(x => cellMarks[x] = true);
            }
            if (gridEntry.centerPencilMarks) {
                const elem = findOrAddElement('center', {});
                const cellMarks = elem.value[cellIdx] = {};
                gridEntry.centerPencilMarks.forEach(x => cellMarks[x] = true);
            }
            if (gridEntry.highlight) {
                const elem = findOrAddElement('colors', {});
                const cellMarks = elem.value[cellIdx] = {};
                cellMarks[gridEntry.highlight] = true;
            }
        }
    }
    if (fBoard['diagonal+'])
        findOrAddElement('diagonal', { positive: true });
    if (fBoard['diagonal-'])
        findOrAddElement('diagonal', { negative: true });
    if (fBoard.antiknight)
        findOrAddElement('knight', true);
    if (fBoard.antiking)
        findOrAddElement('king', true);
    if (fBoard.disjointgroups)
        findOrAddElement('disjointGroups', true);
    if (fBoard.nonconsecutive)
        findOrAddElement('consecutive', { orth: true });
    if (fBoard.thermometer)
        addLineElement('thermo', fBoard.thermometer);
    if (fBoard.betweenline)
        addLineElement('between', fBoard.betweenline);
    if (fBoard.whispers)
        addLineElement('whisper', fBoard.whispers);
    if (fBoard.renban)
        addLineElement('renban', fBoard.renban);
    if (fBoard.palindrome)
        addLineElement('palindrome', fBoard.palindrome);
    if (fBoard.arrow) {
        const elem = findOrAddElement('arrow', {});
        for (const fArrowEntry of fBoard.arrow) {
            for (const fLine of fArrowEntry.lines || []) {
                const arrowItem = elem.value[boardRepr.makeUid()] = {
                    bulb: [],
                    body: [],
                };
                for (const rc of fArrowEntry.cells) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    arrowItem.bulb.push(cellIdx);
                }
                for (const rc of fLine) {
                    const cellIdx = cellCoord2CellIdx(parseRCNotation(rc), grid);
                    arrowItem.body.push(cellIdx);
                }
            }
        }
    }
    if (fBoard.sandwichsum)
        addSeriesElement('sandwich', fBoard.sandwichsum);
    if (fBoard.killercage)
        addKillerElement(fBoard.killercage);
    if (fBoard.extraregion) {
        // TODO: this uses killer cages for now.
        console.warn('Extra region import uses killer cage.');
        addKillerElement(fBoard.extraregion);
    }
    if (fBoard.littlekillersum) {
        const elem = findOrAddElement('littleKiller', {});
        for (const fLkEntry of fBoard.littlekillersum) {
            // Find the equivalent click location.
            // Cell is outside the grid.
            const coord = parseRCNotation(fLkEntry.cell);
            if ('DR' === fLkEntry.direction) {
                coord[0] += 0.75;
                coord[1] += 0.75;
            }
            else if ('DL' === fLkEntry.direction) {
                coord[0] += 0.25;
                coord[1] += 0.75;
            }
            else if ('UR' === fLkEntry.direction) {
                coord[0] += 0.75;
                coord[1] += 0.25;
            }
            else if ('UL' === fLkEntry.direction) {
                coord[0] += 0.25;
                coord[1] += 0.25;
            }
            const diagIdx = svgCoord2diagonalIdx(coord, grid);
            if (null == diagIdx) {
                console.error('Cannot handle this diagonal.', fLkEntry);
                continue;
            }
            elem.value[diagIdx] = (null != fLkEntry.value) ? Number(fLkEntry.value) : true;
        }
    }
    if (fBoard.difference)
        addEdgeElement('difference', fBoard.difference);
    if (fBoard.ratio)
        addEdgeElement('ratio', fBoard.ratio);
    if (fBoard.xv)
        addEdgeElement('xv', fBoard.xv, roman2num);
    if (fBoard.odd)
        addRegionElement('odd', fBoard.odd);
    if (fBoard.even)
        addRegionElement('even', fBoard.even);
    if (fBoard.minimum)
        addRegionElement('min', fBoard.minimum);
    if (fBoard.maximum)
        addRegionElement('max', fBoard.maximum);
    if (fBoard.quadruple) {
        const elem = findOrAddElement('quadruple', {});
        for (const fQuadEntry of fBoard.quadruple) {
            if (4 !== fQuadEntry.cells.length) {
                // Luckily, f-puzzles doesn't allow quadruples on edges.
                console.error('Cannot parse quadruple not between four cells.');
                continue;
            }
            const coord = fQuadEntry.cells
                .map(parseRCNotation)
                .reduce(([x0, y0], [x1, y1]) => [x0 + x1, y0 + y1], [0, 0]);
            coord[0] *= 0.25;
            coord[1] *= 0.25;
            const cornerCoord = svgCoord2cornerCoord(coord, grid);
            if (null == cornerCoord) {
                console.error('Cannot handle this quadruple.', fQuadEntry);
                continue;
            }
            const cornerIdx = cornerCoord2cornerIdx(cornerCoord, grid);
            elem.value[cornerIdx] = (null != fQuadEntry.values) ? fQuadEntry.values : true;
        }
    }
    if (fBoard.clone) {
        const elem = findOrAddElement('clone', {});
        outer: for (const fCloneEntry of fBoard.clone) {
            const cloneItem = elem.value[boardRepr.makeUid()] = {
                color: undefined,
                a: fCloneEntry.cells.map(rc => cellCoord2CellIdx(parseRCNotation(rc), grid)),
                b: fCloneEntry.cloneCells.map(rc => cellCoord2CellIdx(parseRCNotation(rc), grid)),
            };
            // Try to find color from cells.
            let color = null;
            for (const idx of cloneItem.a.concat(cloneItem.b)) {
                const [x, y] = cellIdx2cellCoord(idx, grid);
                const { c } = fBoard.grid[y][x];
                if (null == c)
                    continue outer;
                if (!c.startsWith('#'))
                    continue outer;
                if (null == color)
                    color = c;
                else if (color !== c)
                    continue outer;
            }
            if (null == color)
                continue;
            // All have same color.
            const [h, s, l] = hexToHsluv(color);
            cloneItem.color = hsluvToHex([h, s, 0.5 * l]);
        }
    }
    if (fBoard.negative) {
        // TODO
        console.error(`Cannot handle f-puzzles negative constraints: ${fBoard.negative.join(', ')}.`);
    }
    return board;
}
//# sourceMappingURL=f-puzzles.js.map