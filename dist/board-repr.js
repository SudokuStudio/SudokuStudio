export function makeUid() {
    return `${(31 * Math.floor(0xffffffff * Math.random()) + Date.now()) % 0xffffffff}`;
}
function defaultRegions(size = 9, boxWidth = 3, boxHeight = 3) {
    const regions = {};
    for (let i = 0; i < size; i++) {
        regions[i] = {};
    }
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cellIdx = y * size + x;
            const by = Math.floor(y / boxHeight);
            const bx = Math.floor(x / boxWidth);
            regions[by * boxHeight + bx][cellIdx] = true;
        }
    }
    return regions;
}
export function createNewBoard(createElement, boxWidth = 3, boxHeight = 3) {
    const size = boxWidth * boxHeight;
    const board = {
        grid: {
            width: size,
            height: size,
        },
        meta: {
            title: null,
            author: null,
            description: null,
        },
        elements: {},
    };
    board.elements["1"] = createElement("grid");
    board.elements["2"] = createElement("gridRegion", defaultRegions(size, boxWidth, boxHeight));
    board.elements["10"] = createElement("givens", {});
    board.elements["11"] = createElement("filled", {});
    board.elements["12"] = createElement("corner", {});
    board.elements["13"] = createElement("center", {});
    board.elements["14"] = createElement("colors", {});
    return board;
}
//# sourceMappingURL=board-repr.js.map