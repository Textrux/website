/**
 * Converts a CSV string into a 2D string array.
 * Handles quotes, newlines, commas, etc.
 */
export function fromCSV(csvString: string): string[][] {
  if (!csvString) return [];
  // normalize line endings
  csvString = csvString.replace(/\r\n/g, "\n");

  const rows: string[][] = [];
  let insideQuotes = false;
  let cellValue = "";
  let row: string[] = [];

  for (let i = 0; i < csvString.length; i++) {
    const ch = csvString[i];

    if (ch === '"') {
      if (!insideQuotes) {
        insideQuotes = true;
      } else {
        // check for doubled-quote
        if (i + 1 < csvString.length && csvString[i + 1] === '"') {
          cellValue += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      }
    } else if (!insideQuotes && (ch === "," || ch === "\n")) {
      row.push(cellValue);
      cellValue = "";
      if (ch === "\n") {
        rows.push(row);
        row = [];
      }
    } else {
      cellValue += ch;
    }
  }
  // last cell
  row.push(cellValue);
  rows.push(row);

  return rows;
}

/**
 * Converts a 2D string array into CSV text with quotes where needed.
 */
export function toCSV(arr2D: string[][]): string {
  const lines: string[] = [];
  for (const rowArr of arr2D) {
    const lineParts: string[] = [];
    for (let value of rowArr) {
      if (value == null) value = "";
      // double up quotes
      value = value.replace(/"/g, `""`);
      // wrap in quotes if special chars
      if (/[",\n\r]/.test(value)) {
        value = `"${value}"`;
      }
      lineParts.push(value);
    }
    lines.push(lineParts.join(","));
  }
  return lines.join("\r\n");
}
