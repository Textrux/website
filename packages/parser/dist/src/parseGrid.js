"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGrid = parseGrid;
function parseGrid(cellsData, numberOfRows, numberOfColumns) {
    // Implement your parsing logic here
    // This is a placeholder implementation
    const blocks = [];
    const cellToBlockMap = {};
    // Example: Iterate through cellsData and create blocks
    for (const key in cellsData) {
        const [_, rowStr, colStr] = key.match(/R(\d+)C(\d+)/) || [];
        const row = parseInt(rowStr, 10);
        const col = parseInt(colStr, 10);
        const cell = {
            row,
            col,
            key,
            value: cellsData[key],
        };
        // Placeholder: Add each cell as a separate block
        const block = {
            canvasCells: [cell],
            emptyCells: [],
            cellClusters: [],
            topRow: row,
            bottomRow: row,
            leftCol: col,
            rightCol: col,
            canvasBorderCells: [],
        };
        blocks.push(block);
        cellToBlockMap[key] = block;
    }
    return {
        blocks,
        cellToBlockMap,
    };
}
