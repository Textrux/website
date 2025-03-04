import { fromCSV, toCSV } from "./CSV";

/******************************************************
 * SQUIB Generator from CSV
 ******************************************************/
export function generateSquibFromCSV(csvString) {
  // 1) Parse the CSV into a 2D array
  const data = fromCSV(csvString) || [];
  const originalRows = data.length;
  const originalCols = originalRows > 0 ? data[0].length : 0;

  // 2) Determine a square size that is a multiple of 8
  let size = Math.max(originalRows, originalCols);
  while (size % 8 !== 0) {
    size++;
  }

  // Create a new 2D array of dimension size x size, padding with ""
  const grid = [];
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

  // 3) Build the byte array, binary string, and filled-values array
  const bytes = [];
  const binaryStringLines = [];
  const filledValues = [];

  // Each row of 'size' cells => size bits => size/8 bytes
  // We store them 8 bits at a time
  for (let r = 0; r < size; r++) {
    let rowBits = "";
    // Go in 8-bit segments
    for (let segment = 0; segment < size; segment += 8) {
      let currentByte = 0;
      let segmentBits = "";
      for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
        const c = segment + bitIndex;
        const isFilled = grid[r][c] && grid[r][c].trim().length > 0;
        segmentBits += isFilled ? "1" : "0";
        currentByte = (currentByte << 1) | (isFilled ? 1 : 0);

        // If filled, add value to filledValues
        if (isFilled) {
          filledValues.push(grid[r][c]);
        }
      }
      // Append this byte to the bytes array
      bytes.push(currentByte);
      // Add these 8 bits to our rowBits
      rowBits += segmentBits;
      rowBits += " "; // space-separate each 8-bit group
    }
    binaryStringLines.push(rowBits.trim());
  }

  // Create a multiline string (one row per line)
  const binaryString = binaryStringLines.join("\n");

  return {
    size, // side length of the square grid
    bytes, // array of bytes
    binaryString, // string representation (grouped in 8 bits/row)
    filledValues, // 1D array of non-empty cell contents
  };
}

/******************************************************
 * SQUIB Parser
 ******************************************************/
export function parseSquibToCSV(bytes, filledValues, size) {
  // We assume size x size total cells, with size multiple of 8
  const grid = [];
  let fillIndex = 0; // tracks which filledValues item we are on

  // Each row has size bits => size/8 bytes
  // 'bytes' should have size*(size/8) total entries
  const expectedBytes = size * (size / 8);
  if (bytes.length !== expectedBytes) {
    throw new Error("Byte array length does not match grid dimensions.");
  }

  // Reconstruct
  let byteCursor = 0;
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let segment = 0; segment < size; segment += 8) {
      const currentByte = bytes[byteCursor++];
      // Read from MSB to LSB (or adjust if needed)
      for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
        const mask = 1 << bitIndex;
        const isFilled = (currentByte & mask) !== 0;
        if (isFilled) {
          // Place next filledValues entry
          grid[r][segment + (7 - bitIndex)] = filledValues[fillIndex++];
        } else {
          grid[r][segment + (7 - bitIndex)] = "";
        }
      }
    }
  }

  // Now convert grid to CSV
  const csvString = toCSV(grid);
  return csvString;
}
