import { Grid } from './types';

export function parseGrid(
  cellsData: Record<string, string>,
  numberOfRows: number,
  numberOfColumns: number
): GridModel {
  // Implement your parsing logic here
  // This is a placeholder implementation
  const blocks: Block[] = [];
  const cellToBlockMap: Record<string, Block> = {};

  // Example: Iterate through cellsData and create blocks
  for (const key in cellsData) {
    const [_, rowStr, colStr] = key.match(/R(\d+)C(\d+)/) || [];
    const row = parseInt(rowStr, 10);
    const col = parseInt(colStr, 10);
    const cell: Cell = {
      row,
      col,
      key,
      value: cellsData[key],
    };

    // Placeholder: Add each cell as a separate block
    const block: Block = {
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
