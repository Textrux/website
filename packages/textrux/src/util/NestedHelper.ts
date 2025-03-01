/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "../structure/Grid";
import { toCSV } from "./CSV";

/**
 * Convert the entire grid to CSV, optionally ignoring the parent cell (R1C1)
 * if it starts with "^" (meaning it's the parent's wrapper).
 */
export function sheetToCsv(grid: Grid, skipParentCell?: boolean): string {
  // 1) Find the highest row & col actually used (so we don’t generate thousands of empty lines).
  let maxRowUsed = 0;
  let maxColUsed = 0;
  const filled = grid.getFilledCells(); // Already available in Grid
  for (const { row, col } of filled) {
    // If skipping the “parent cell”, check if row=1,col=1 && the raw starts with '^'
    if (skipParentCell && row === 1 && col === 1) {
      const val = grid.getCellRaw(1, 1);
      if (val.startsWith("^")) {
        continue; // skip counting R1C1
      }
    }
    if (row > maxRowUsed) maxRowUsed = row;
    if (col > maxColUsed) maxColUsed = col;
  }

  // 2) Build a 2D array of size [maxRowUsed x maxColUsed]
  const arr: string[][] = [];
  for (let r = 0; r < maxRowUsed; r++) {
    const rowArr = new Array<string>(maxColUsed).fill("");
    arr.push(rowArr);
  }

  // 3) Fill it from the grid
  for (const { row, col, value } of filled) {
    if (skipParentCell && row === 1 && col === 1 && value.startsWith("^")) {
      // Skip
      continue;
    }
    // row-1 and col-1 (for 0-based array)
    arr[row - 1][col - 1] = value;
  }

  // 4) Use your Textrux “toCSV” helper
  return toCSV(arr);
}

/**
 * Replace the entire grid contents with a 2D array’s data.
 * (Clears the grid, then sets each cell from the array.)
 */
export function arrayToGrid(grid: Grid, arr2D: string[][]): void {
  // Wipe out everything
  // (We can do it by clearing the “contentsMap” directly,
  //  but let’s just do it using normal APIs.)
  // For big grids, you might do an internal wipe. For clarity:
  (grid as any).contentsMap = {};
  (grid as any).formulas = {};

  const numRows = arr2D.length;
  let maxCols = 0;
  for (const rowArr of arr2D) {
    if (rowArr.length > maxCols) {
      maxCols = rowArr.length;
    }
  }
  // Optionally resize if needed:
  if (numRows > grid.rows) {
    grid.resizeRows(numRows);
  }
  if (maxCols > grid.cols) {
    grid.resizeCols(maxCols);
  }

  // Insert
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < arr2D[r].length; c++) {
      const val = arr2D[r][c];
      if (val && val.trim() !== "") {
        grid.setCellRaw(r + 1, c + 1, val);
      }
    }
  }
}

/**
 * Figure out "depth" by looking for something like "^<<)3(>>" in R1C1.
 * For simplicity, we just look for <<)n(>> in the text.
 * If not found, returns 0.
 */
export function getDepthFromWrapper(str: string): number {
  const match = str.match(/<<\)(\d+)\(>>/);
  if (!match) return 0;
  return parseInt(match[1], 10);
}

/**
 * In the old code, we replaced the marker like <<)depth(>> with an embedded CSV, etc.
 * This function tries to do the same. You can keep it simple if you like.
 */
export function replaceMarkerInWrapper(
  wrapper: string,
  depth: number,
  childCsv: string
): string {
  // The marker we look for:
  const marker = `<<)${depth}(>>`;

  // We might enclose the CSV in quotes or something. For simplicity:
  // let escapedCsv = childCsv.replace(/"/g, '""');
  // But if you want to keep it simpler, just do a direct .replace:
  const newWrapper = wrapper.replace(
    marker,
    `<<(${depth})${childCsv}(${depth})>>`
  );
  return newWrapper;
}

/**
 * Another approach is to embed the current child CSV in place of the marker.
 * You can adapt from the old code’s “embedCurrentCsvInWrapper” or “removeCaret” logic.
 */
export function embedCurrentCsvInWrapper(
  parentCsv: string,
  depth: number,
  childCsv: string
): string {
  // We'll just do a straightforward example:
  const marker = `<<)${depth}(>>`;
  // Escape double-quotes inside the child CSV
  const escapedChild = childCsv.replace(/"/g, '""');

  const newWrapper = parentCsv.replace(marker, `"${escapedChild}"`);
  // If none replaced, oh well:
  return newWrapper;
}
