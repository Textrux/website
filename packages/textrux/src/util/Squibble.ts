/******************************************************
 * SQUIB Generator from CSV
 ******************************************************/

import { fromCSV, toCSV } from "./CSV";

/**
 * Interface describing what generateSquibFromCSV returns.
 */
export interface SquibData {
  size: number;
  bytes: number[]; // array of bytes (row by row, 8 bits at a time)
  binaryString: string; // multiline string representation of those bits
  filledValues: string[]; // all non-empty cell contents in the order encountered
}

/**
 * Generates a SQUIB from a CSV string.
 *
 * - Ensures the grid is NxN where N is multiple of 8
 * - Produces an array of bytes (SQUIB) representing which cells are filled (1) vs empty (0)
 * - Returns a multiline binary string for debugging
 * - Returns an array of filledValues that correspond to the cells that were "1"
 */
export function generateSquibFromCSV(csvString: string): SquibData {
  // 1) Parse the CSV into a 2D array
  const data = fromCSV(csvString) || [];
  const originalRows = data.length;
  const originalCols = originalRows > 0 ? data[0].length : 0;

  // 2) Determine a square size that is a multiple of 8
  let size = Math.max(originalRows, originalCols);
  while (size % 8 !== 0) {
    size++;
  }

  // 3) Create a new 2D array of dimension size x size, padding with ""
  const grid: string[][] = [];
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      if (r < originalRows && c < originalCols) {
        grid[r][c] = data[r][c];
      } else {
        grid[r][c] = ""; // pad
      }
    }
  }

  // 4) Build the byte array, binary string, and filled-values array
  const bytes: number[] = [];
  const binaryStringLines: string[] = [];
  const filledValues: string[] = [];

  // Each row of 'size' cells => size bits => size/8 bytes
  // We store them 8 bits at a time
  for (let r = 0; r < size; r++) {
    let rowBits = "";
    for (let segment = 0; segment < size; segment += 8) {
      let currentByte = 0;
      let segmentBits = "";
      for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
        const c = segment + bitIndex;
        const isFilled = grid[r][c] && grid[r][c].trim().length > 0;
        segmentBits += isFilled ? "1" : "0";
        currentByte = (currentByte << 1) | (isFilled ? 1 : 0);

        if (isFilled) {
          filledValues.push(grid[r][c]);
        }
      }
      bytes.push(currentByte);
      rowBits += segmentBits + " ";
    }
    binaryStringLines.push(rowBits.trim());
  }

  // 5) Create a multiline string (one row per line) for debug
  const binaryString = binaryStringLines.join("\n");

  return {
    size,
    bytes,
    binaryString,
    filledValues,
  };
}

/******************************************************
 * SQUIB Parser
 ******************************************************/

/**
 * Reconstructs a CSV grid from:
 *  - `bytes`: The array of bytes containing the bits for each cell (row by row)
 *  - `filledValues`: The actual string contents for each filled cell
 *  - `size`: The size (rows = cols) of the reconstructed grid
 *
 * Returns a CSV string that reconstructs the original grid.
 */
export function parseSquibToCSV(
  bytes: number[],
  filledValues: string[],
  size: number
): string {
  // We assume size x size total cells, with size multiple of 8
  const grid: string[][] = [];
  let fillIndex = 0;

  // Each row has size bits => (size/8) bytes
  // 'bytes' should have size * (size/8) total entries
  const expectedBytes = size * (size / 8);
  if (bytes.length !== expectedBytes) {
    throw new Error("Byte array length does not match grid dimensions.");
  }

  let byteCursor = 0;
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let segment = 0; segment < size; segment += 8) {
      const currentByte = bytes[byteCursor++];
      // Read from MSB to LSB: bitIndex=7 => leftmost
      for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
        const mask = 1 << bitIndex;
        const isFilled = (currentByte & mask) !== 0;
        if (isFilled) {
          grid[r][segment + (7 - bitIndex)] = filledValues[fillIndex++];
        } else {
          grid[r][segment + (7 - bitIndex)] = "";
        }
      }
    }
  }

  // Convert to CSV
  const csvString = toCSV(grid);
  return csvString;
}
