/*******************************************************
 * patterns.js
 *
 * Defines a flexible system for describing "structures"
 * (Cell Patterns, Cell Cluster Patterns, Block Patterns, etc.)
 * along with parse and format routines.
 *******************************************************/

window.PatternsManager = (function () {
  /*******************************************************
   * We hold an array of pattern definitions.
   * Each definition might look like:
   *
   * {
   *   name: "IgnoreCaretCell",
   *   level: "cell",
   *   parse(cellValue, row, col) {...},
   *   format(cellElement, parseResult) {...}
   * }
   *
   * Or:
   *
   * {
   *   name: "ContiguousTable",
   *   level: "contiguousCellCluster",
   *   parse(clusterCells, block) {...},
   *   format(clusterCells, parseResult, block) {...}
   * }
   *
   * ...
   *
   * The "parse" method returns either null (if no match)
   * or an object with parse details (if matched).
   * The "format" method can apply CSS or finalize the structure.
   *
   * We'll keep them separate by "level" so that in parseAll(),
   * we know in which pass they should be invoked.
   *******************************************************/
  const patternDefinitions = {
    cell: [], // cell-level patterns
    contiguousCellCluster: [], // patterns for a single contiguous cell cluster
    block: [], // patterns at block level
    blockCluster: [], // patterns at block cluster level
    // etc. for non-contiguousCellCluster if you like
  };

  /**
   * registerPattern(definition)
   *  - definition.level must be one of:
   *    "cell", "contiguousCellCluster", "block", "blockCluster"
   */
  function registerPattern(def) {
    if (!patternDefinitions[def.level]) {
      console.warn(
        `Unknown pattern level "${def.level}". Not registering pattern "${def.name}".`
      );
      return;
    }
    patternDefinitions[def.level].push(def);
  }

  /**
   * parseAll(...)
   *  - This is our main entry point after blocks & clusters are identified.
   *  - We'll do each level in some order: cell => clusters => block => block clusters => etc.
   *
   *  - For "cell" patterns, we might iterate over all filled cells or all cells in the block bounding box.
   *  - For "contiguousCellCluster" patterns, we iterate over each block’s cellClusters.
   *  - For "block" patterns, we iterate over all blocks themselves.
   *  - For "blockCluster" patterns, we iterate over blockClusters, etc.
   *
   * Right now, let’s just handle:
   *   1) cell-level patterns
   *   2) contiguousCellCluster-level patterns
   */
  function parseAll(filledCells, blockList) {
    /*******************************************************
     * 1) Cell-level patterns
     *******************************************************/
    // We'll store a "cellPatternResults" map from "R{r}C{c}" => array of parse results
    const cellPatternResults = {};

    for (let fc of filledCells) {
      const { row, col, key } = fc;
      const val = window.cellsData["R" + row + "C" + col] || "";
      const resultsForCell = [];

      for (let patternDef of patternDefinitions.cell) {
        const parseResult = patternDef.parse(val, row, col);
        if (parseResult) {
          resultsForCell.push({
            patternName: patternDef.name,
            data: parseResult,
          });
        }
      }

      if (resultsForCell.length > 0) {
        cellPatternResults[key] = resultsForCell;
      }
    }

    // After we gather all parse results for each cell, let's do optional formatting
    for (let key in cellPatternResults) {
      const row = parseInt(key.match(/R(\d+)C(\d+)/)[1]);
      const col = parseInt(key.match(/R(\d+)C(\d+)/)[2]);
      const td = getCellElement(row, col);

      cellPatternResults[key].forEach((res) => {
        // find the patternDef again so we can call format
        let def = patternDefinitions.cell.find(
          (d) => d.name === res.patternName
        );
        if (def && def.format) {
          def.format(td, res.data);
        }
      });
    }

    /*******************************************************
     * 2) Contiguous Cell Cluster Patterns (like Table, Tree)
     *******************************************************/
    // We'll store cluster-level parse results in block.clusterPatterns = []
    for (let block of blockList) {
      if (!block.cellClusters) continue;

      block.clusterPatterns = [];
      for (let clusterCells of block.cellClusters) {
        // clusterCells is an array of { row, col }
        // We'll attempt each pattern in "contiguousCellCluster"
        for (let patternDef of patternDefinitions.contiguousCellCluster) {
          const parseResult = patternDef.parse(clusterCells, block);
          if (parseResult) {
            block.clusterPatterns.push({
              patternName: patternDef.name,
              clusterCells,
              data: parseResult,
            });
          }
        }
      }
    }

    // After we parse them, we call .format for each recognized pattern
    for (let block of blockList) {
      if (!block.clusterPatterns) continue;
      for (let recognized of block.clusterPatterns) {
        const patternDef = patternDefinitions.contiguousCellCluster.find(
          (d) => d.name === recognized.patternName
        );
        if (patternDef && patternDef.format) {
          patternDef.format(recognized.clusterCells, recognized.data, block);
        }
      }
    }

    // Similarly, you'd repeat for block-level patterns, block-cluster-level patterns, etc.
  }

  /*******************************************************
   * Basic helper to find the <td> element at (r,c)
   *******************************************************/
  function getCellElement(r, c) {
    return document.querySelector(
      `#spreadsheet td[data-row='${r}'][data-col='${c}']`
    );
  }

  /*******************************************************
   * Return our manager interface
   *******************************************************/
  return {
    registerPattern,
    parseAll,
  };
})();

/*******************************************************
 * Example pattern definitions: Cell Patterns
 *******************************************************/

// 1) “Ignore Cell if starts with ^”
PatternsManager.registerPattern({
  name: "IgnoreCaretCell",
  level: "cell",
  parse: (cellValue, row, col) => {
    if (cellValue.startsWith("^")) {
      // Return an object indicating we matched (and any extra data)
      return { reason: "Cell starts with caret '^', ignoring for parsing." };
    }
    return null; // no match
  },
  format: (tdElement, parseResult) => {
    // E.g., gray out the cell or italicize
    tdElement.style.backgroundColor = "#ccc";
    tdElement.style.color = "#666";
    tdElement.title = parseResult.reason; // tooltip
  },
});

// 2) “Embedded CSV Cell if starts with ,”
PatternsManager.registerPattern({
  name: "EmbeddedCsvCell",
  level: "cell",
  parse: (cellValue, row, col) => {
    if (cellValue.startsWith(",")) {
      return { message: "Embedded CSV found in cell." };
    }
    return null;
  },
  format: (tdElement, parseResult) => {
    tdElement.style.backgroundColor = "#bfe"; // bluish
    tdElement.title = parseResult.message;
  },
});

// 3) “Underscore Cell” if starts with _
PatternsManager.registerPattern({
  name: "UnderscoreCell",
  level: "cell",
  parse: (cellValue, row, col) => {
    if (cellValue.startsWith("_")) {
      return { message: "This cell is a placeholder" };
    }
    return null;
  },
  format: (tdElement, parseResult) => {
    tdElement.classList.add("underscore-cell");
  },
});

/*******************************************************
 * Example pattern definitions:
 *   Contiguous Cell Cluster Patterns (Table, Tree)
 *******************************************************/

/**
 * "Table" pattern
 *   - We simply check if the cluster forms a rectangular block
 *     and see if it might have a header row (very simplistic).
 *   - In real usage, you’d implement your table detection logic,
 *     then store any relevant info in parseResult.
 */
PatternsManager.registerPattern({
  name: "TablePattern",
  level: "contiguousCellCluster",
  parse: (clusterCells, block) => {
    // Quick check: Are clusterCells in a perfect rectangle?
    //  1) find minR, maxR, minC, maxC
    const rows = clusterCells.map((pt) => pt.row);
    const cols = clusterCells.map((pt) => pt.col);
    const minR = Math.min(...rows),
      maxR = Math.max(...rows);
    const minC = Math.min(...cols),
      maxC = Math.max(...cols);

    const totalNeeded = (maxR - minR + 1) * (maxC - minC + 1);
    if (clusterCells.length === totalNeeded) {
      // It's a full rectangle => assume "Table" matched
      // We'll store rowCount, colCount, topRow, leftCol, etc.
      return {
        isRectangle: true,
        rowCount: maxR - minR + 1,
        colCount: maxC - minC + 1,
        topRow: minR,
        leftCol: minC,
      };
    }
    return null; // not a perfect rectangle => not recognized as a "Table"
  },
  format: (clusterCells, parseResult, block) => {
    // If parseResult is truthy, we found a table. Let's format it:
    if (parseResult.isRectangle) {
      // Example styling: highlight the top row in a different color
      const { rowCount, colCount, topRow, leftCol } = parseResult;
      for (let c = leftCol; c < leftCol + colCount; c++) {
        const td = document.querySelector(
          `#spreadsheet td[data-row='${topRow}'][data-col='${c}']`
        );
        if (td) {
          td.style.borderBottom = "2px solid #000";
          td.style.fontWeight = "bold";
        }
      }
      // (You could also do zebra striping for data rows, etc.)
    }
  },
});

/**
 * "Tree" pattern (extremely simplified).
 *   - For demonstration, we’ll do a trivial check:
 *     if the cluster is taller than wide, we “guess” it’s a tree
 *     with primary direction down, secondary right.
 */
PatternsManager.registerPattern({
  name: "TreePattern",
  level: "contiguousCellCluster",
  parse: (clusterCells, block) => {
    // find bounding box
    const rows = clusterCells.map((pt) => pt.row);
    const cols = clusterCells.map((pt) => pt.col);
    const height = Math.max(...rows) - Math.min(...rows) + 1;
    const width = Math.max(...cols) - Math.min(...cols) + 1;

    if (height > width) {
      return {
        primaryDirection: "down",
        secondaryDirection: "right",
        boundingBox: {
          top: Math.min(...rows),
          bottom: Math.max(...rows),
          left: Math.min(...cols),
          right: Math.max(...cols),
        },
      };
    }
    return null; // If not recognized
  },
  format: (clusterCells, parseResult, block) => {
    if (!parseResult) return;
    // Maybe color all cells in a greenish hue to indicate a “Tree”
    clusterCells.forEach((pt) => {
      const td = document.querySelector(
        `#spreadsheet td[data-row='${pt.row}'][data-col='${pt.col}']`
      );
      if (td) {
        td.style.backgroundColor = "#e2ffe2";
      }
    });
  },
});
