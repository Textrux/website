function fromCSV(csvString) {
    // parse CSV with quotes, newlines, etc.
    if (!csvString) return [];
  
    // normalize line endings
    csvString = csvString.replace(/\r\n/g, "\n");
  
    let rows = [];
    let len = csvString.length;
    let insideQuotes = false;
    let cellValue = "";
    let row = [];
    let i = 0;
  
    while (i < len) {
      let ch = csvString[i];
  
      if (ch === '"') {
        if (!insideQuotes) {
          insideQuotes = true;
        } else {
          // check for doubled-quote
          if (i + 1 < len && csvString[i + 1] === '"') {
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
      i++;
    }
  
    // last cell
    row.push(cellValue);
    rows.push(row);
  
    return rows;
  }
  
  function toCSV(arr2D) {
    let lines = [];
    for (let r = 0; r < arr2D.length; r++) {
      let rowArr = arr2D[r] || [];
      let lineParts = [];
      for (let c = 0; c < rowArr.length; c++) {
        let value = rowArr[c] == null ? "" : String(rowArr[c]);
        // double up quotes
        value = value.replace(/"/g, '""');
        // if any special characters => wrap in quotes
        if (/[",\n\r]/.test(value)) {
          value = `"${value}"`;
        }
        lineParts.push(value);
      }
      lines.push(lineParts.join(","));
    }
    return lines.join("\r\n");
  }

  export {fromCSV, toCSV};