// File: src/App.tsx

import React from "react";
import { GridModel, GridView, fromCSV, fromTSV } from "textrux";

function App() {
  // Create the model once, and also try to load from localStorage if available:
  const model = React.useMemo(() => {
    // Start with a new grid.
    const m = new GridModel(50, 50);

    // 1) Check localStorage
    const saved = localStorage.getItem("savedGridData");
    if (saved) {
      // 2) Decide delimiter (tab vs comma)
      const delim = saved.includes("\t") ? "\t" : ",";
      const arr = delim === "\t" ? fromTSV(saved) : fromCSV(saved);

      // 3) Ensure grid has enough rows/cols
      const maxRows = arr.length;
      let maxCols = 0;
      for (const rowArr of arr) {
        if (rowArr.length > maxCols) {
          maxCols = rowArr.length;
        }
      }
      if (maxRows > m.rows) m.resizeRows(maxRows);
      if (maxCols > m.cols) m.resizeCols(maxCols);

      // 4) Fill the grid
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c];
          // You can skip leading/trailing whitespace if desired:
          if (val.trim() !== "") {
            m.setCellRaw(r + 1, c + 1, val);
          }
        }
      }
    }

    return m;
  }, []);

  return (
    <div className="w-screen h-screen">
      <GridView grid={model} />
    </div>
  );
}

export default App;
