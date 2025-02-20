export function fromTSV(tsvString: string): string[][] {
  if (!tsvString) return [];
  tsvString = tsvString.replace(/\r\n/g, "\n");

  const rows: string[][] = [];
  let insideQuotes = false;
  let cellValue = "";
  let row: string[] = [];

  for (let i = 0; i < tsvString.length; i++) {
    const ch = tsvString[i];

    if (ch === '"') {
      if (!insideQuotes) {
        insideQuotes = true;
      } else {
        if (i + 1 < tsvString.length && tsvString[i + 1] === '"') {
          cellValue += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      }
    } else if (!insideQuotes && (ch === "\t" || ch === "\n")) {
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

  row.push(cellValue);
  rows.push(row);
  return rows;
}

export function toTSV(arr2D: string[][]): string {
  const lines: string[] = [];
  for (const rowArr of arr2D) {
    const lineParts: string[] = [];
    for (let value of rowArr) {
      if (value == null) value = "";
      value = value.replace(/"/g, `""`);
      if (/["\t\n\r]/.test(value)) {
        value = `"${value}"`;
      }
      lineParts.push(value);
    }
    lines.push(lineParts.join("\t"));
  }
  return lines.join("\r\n");
}
