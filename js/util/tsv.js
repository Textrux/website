function fromTSV(tsvString) {
  if (!tsvString) return [];

  // Normalize line endings
  tsvString = tsvString.replace(/\r\n/g, "\n");

  let rows = [];
  let len = tsvString.length;
  let insideQuotes = false;
  let cellValue = "";
  let row = [];
  let i = 0;

  while (i < len) {
    let ch = tsvString[i];

    if (ch === '"') {
      if (!insideQuotes) {
        insideQuotes = true;
      } else {
        // Check for double-quote escape
        if (i + 1 < len && tsvString[i + 1] === '"') {
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
    i++;
  }

  // Last cell
  row.push(cellValue);
  rows.push(row);

  return rows;
}

function toTSV(arr2D) {
  let lines = [];
  for (let r = 0; r < arr2D.length; r++) {
    let rowArr = arr2D[r] || [];
    let lineParts = [];
    for (let c = 0; c < rowArr.length; c++) {
      let value = rowArr[c] == null ? "" : String(rowArr[c]);
      // Double up quotes
      value = value.replace(/"/g, '""');
      // If special characters exist, wrap in quotes
      if (/[\"\t\n\r]/.test(value)) {
        value = `"${value}"`;
      }
      lineParts.push(value);
    }
    lines.push(lineParts.join("\t"));
  }
  return lines.join("\r\n");
}

export { fromTSV, toTSV };
