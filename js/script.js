/******************************************************
 * csv.js
 *
 * Custom CSV/TSV code that handles quotes & newlines
 ******************************************************/

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

/******************************************************
 * popup.js
 *
 * Shows the modal popup on gear icon click,
 * with four tabs: Settings, Examples, Instructions, About.
 ******************************************************/

(() => {
  const overlay = document.getElementById("modalOverlay");
  const popupBox = document.getElementById("popupBox");
  const closeButton = document.getElementById("popupCloseButton");
  const tabs = document.querySelectorAll("#popupTabs .popupTab");
  const contentDiv = document.getElementById("popupContent");

  // Default "Copy as: CSV/TSV" setting is TSV.
  // We’ll use a simple <select> to control the global `currentDelimiter`.
  const settingsHTML = `
    <label for="delimiterSelect"><strong>Copy as:</strong></label>
    <select id="delimiterSelect">
      <option value="tab" selected>TSV</option>
      <option value=",">CSV</option>
    </select>
    <br><br>
    <button id="clearGridButton" style="margin-top:10px; padding:6px 12px; font-size:14px;">Clear Grid</button>
    <br><br>
    <button id="saveGridButton" style="padding:6px 12px; font-size:14px;">Save Grid to File</button>
    <br><br>
    <!-- hidden file input for loading a grid -->
    <input type="file" id="loadGridFileInput" accept=".csv,.tsv" style="display:none;">
    <button id="loadGridButton" style="padding:6px 12px; font-size:14px;">Load Grid from File</button>
  `;

  // Instead of a simple list, we now define an array of example objects.
  // Each object contains the example's display name, file name, and description.
  const examples = [
    {
      name: "Block Basics",
      file: "BlockBasics.csv",
      description:
        "A simple intro into the basic text structure called the block.",
    },
    {
      name: "JSON",
      file: "Json.csv",
      description:
        "A simple example of how JSON-style data can be represented as a text structure.",
    },
    {
      name: "JSON Schema",
      file: "JsonSchema.csv",
      description: "Include the schema and rules for JSON-style data.",
    },
    {
      name: "JSON Schema with Data",
      file: "JsonSchemaWithData.csv",
      description:
        "A text structure with a JSON-style schema and multiple tuples of data",
    },
    {
      name: "JSON Schema with Data Transposed",
      file: "JsonSchemaWithDataTransposed.csv",
      description:
        "A text structure with a JSON-style schema and multiple tuples of data oriented vertically (and arguably more naturally) instead of horizontally. ",
    },
    {
      name: "LISP",
      file: "LISP.csv",
      description: "Define and call a simple LISP-style function.",
    },
    {
      name: "LISP Recursive",
      file: "LISPRecursive.csv",
      description: "Define and call a recursive LISP-style function.",
    },
    {
      name: "State Machine Traffic Light",
      file: "StateMachineTrafficLight.csv",
      description:
        "Defining a simple state machine for a traffic light with a pedestrian crossing.",
    },
    {
      name: "Recursive Grid Cells",
      file: "RecursiveGridCells.csv",
      description:
        "A cell can contain another grid. Select a grid cell (a cell that starts with a comma) and hit <code>F3</code> to enter it. Continue down as many levels as you want adding content at each level. To go back up a level press <code>Esc</code>.",
    },
  ];

  // This function returns HTML that renders a <select> element
  // with a fixed size (to show 10 items at once), a description area,
  // and a Load button.
  function renderExamples() {
    let html = `<p>Select one of the examples and press <i>Load</i>:</p>`;
    html += `<select id="exampleSelect" size="10" style="width:100%; margin-bottom:10px;">`;
    examples.forEach((ex) => {
      html += `<option value="${ex.name}">${ex.name}</option>`;
    });
    html += `</select>`;
    html += `<div id="exampleDescription" style="margin-bottom:10px; border:1px solid #ccc; padding:6px; min-height:100px;"></div>`;
    html += `<button id="loadExampleButton" style="padding:6px 12px; font-size:14px;">Load</button>`;
    return html;
  }

  const instructionsHTML = `
      <h3>Instructions</h3>
      <p>Enter text in cells to build text structures. The structures are built from the location of the filled cells on the grid.</p>
      <p>The primary structure is a "block" which is surrounded by a light yellow "border" and and bright yellow "frame".</p>
      <p>The area inside the border of a block is called the "canvas". The canvas has filled cells with a white background along with empty canvas cells with a light blue background. Nearby filled cells on a canvas form a "cell cluster" and the empty cells in a cell cluster have a darker blue background.</p>
      <p>When two blocks are placed close enough to each other their borders and frames may overlap. If only the frames overlap, the background color of those cells is orange. If a frame overlaps with a border, the background color of those cells is red. Blocks that share only orange cells are considered "linked" while blocks that also share red cells are considered "locked". These overlapping blocks form "block clusters". </p>
      <p>Select a cell in a block's canvas and then hit <code>Ctrl+ArrowKey</code> to move the cell in that direction (but stop before merging with any blocks in its path).</p>
      <p>Select a cell in a block's canvas and then hit <code>Ctrl+Alt+ArrowKey</code> to move the cell in that direction and merge with any blocks in its path.</p>
      <p>Select a cell in a block's canvas and then hit <code>Alt+ArrowKey</code> to select another block in that direction.</p>
      <p>To view the grid without any formatting press <code>Ctrl+Shift+Tilde</code>.</p>
      <p>To create a grid within a cell, select a cell and press <code>F3</code>. Make changes and press <code>Esc</code> to return to the outer grid. Can create any number of grid cells at any number of levels (still a little buggy).</p>
    `;

  const aboutHTML = `
      <h3>About</h3>
      <p>Textrux (short for Text Structures > Text Strux > Textrux) is a content-driven-formatting grid that finds structures using the placement of the text on the grid.</p>
      <p>The Github repository for this site can be found <a href="https://github.com/Textrux/website" target="_blank">here</a>.</p>
    `;

  function saveGridToFile() {
    let arr2D = [];
    let maxRow = 1,
      maxCol = 1;

    // Determine the grid size from cellsData
    for (let key in cellsData) {
      let match = key.match(/R(\d+)C(\d+)/);
      if (match) {
        const row = parseInt(match[1]);
        const col = parseInt(match[2]);
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
      }
    }

    // Build a 2D array filled with empty strings
    for (let r = 0; r < maxRow; r++) {
      arr2D[r] = new Array(maxCol).fill("");
    }

    // Populate the array from cellsData
    for (let key in cellsData) {
      let match = key.match(/R(\d+)C(\d+)/);
      if (match) {
        const row = parseInt(match[1]) - 1;
        const col = parseInt(match[2]) - 1;
        arr2D[row][col] = cellsData[key];
      }
    }

    // Convert the 2D array to CSV or TSV using your global functions
    const text = currentDelimiter === "tab" ? toTSV(arr2D) : toCSV(arr2D);

    // Generate the default file name based on the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const defaultName = `grid_${year}${month}${day}_${hours}${minutes}${seconds}`;

    // Prompt the user to enter a file name (without extension)
    let fileName = prompt("Enter file name (without extension):", defaultName);
    if (fileName === null) {
      // User hit cancel, so do not download anything.
      return;
    }
    // If the user leaves it blank, use the default name.
    if (!fileName) {
      fileName = defaultName;
    }

    // Append the appropriate extension
    fileName += currentDelimiter === "tab" ? ".tsv" : ".csv";

    // Create a Blob and a temporary link to download the file
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadTab(tabName) {
    tabs.forEach((t) => t.classList.remove("active"));
    let tabEl = Array.from(tabs).find((t) => t.dataset.tab === tabName);
    if (tabEl) tabEl.classList.add("active");

    switch (tabName) {
      case "Settings":
        contentDiv.innerHTML = settingsHTML;
        const sel = contentDiv.querySelector("#delimiterSelect");
        if (sel) {
          // Load from localStorage or default to "tab" (TSV)
          sel.value = localStorage.getItem("savedDelimiter") || "tab";
          currentDelimiter = sel.value; // Ensure it's set globally

          sel.addEventListener("change", () => {
            currentDelimiter = sel.value;
            localStorage.setItem("savedDelimiter", sel.value); // Save to localStorage
          });
        }

        // Handle "Clear Grid" button click
        const clearButton = contentDiv.querySelector("#clearGridButton");
        if (clearButton) {
          clearButton.addEventListener("click", () => {
            if (
              confirm("Are you sure you want to delete everything on the grid?")
            ) {
              cellsData = {}; // Reset all cell data
              localStorage.removeItem(STORAGE_KEY); // Remove saved data
              parseAndFormatGrid(); // Clear the grid visually
              closePopup();
            }
          });
        }

        // Save Grid button
        const saveGridButton = contentDiv.querySelector("#saveGridButton");
        if (saveGridButton) {
          saveGridButton.addEventListener("click", saveGridToFile);
        }

        // Load Grid from File button and file input handler
        const loadGridButton = contentDiv.querySelector("#loadGridButton");
        const loadGridFileInput = document.getElementById("loadGridFileInput");

        if (loadGridButton) {
          loadGridButton.addEventListener("click", () => {
            loadGridFileInput.click();
          });
        }

        loadGridFileInput.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (event) {
            const text = event.target.result;
            // Determine delimiter automatically (TSV if tab exists)
            const delim = text.indexOf("\t") >= 0 ? "\t" : ",";
            const dataArray = delim === "\t" ? fromTSV(text) : fromCSV(text);

            // Clear current grid data
            cellsData = {};

            // Optionally, adjust the grid size if needed:
            const requiredRows = dataArray.length;
            const requiredCols = Math.max(
              ...dataArray.map((row) => row.length)
            );
            if (requiredRows > numberOfRows) {
              addRows(requiredRows - numberOfRows);
            }
            if (requiredCols > numberOfColumns) {
              addColumns(requiredCols - numberOfColumns);
            }

            // Populate cellsData from the file’s contents
            for (let r = 0; r < dataArray.length; r++) {
              for (let c = 0; c < dataArray[r].length; c++) {
                const val = dataArray[r][c];
                if (val.trim()) {
                  const rowIndex = r + 1;
                  const colIndex = c + 1;
                  const key = `R${rowIndex}C${colIndex}`;
                  cellsData[key] = val;
                }
              }
            }
            parseAndFormatGrid();
          };
          reader.readAsText(file);
          // Reset the file input so the same file can be reselected if desired
          this.value = "";
        });

        break;

      case "Examples":
        contentDiv.innerHTML = renderExamples();

        // Set up event listeners for the Examples tab.
        const exampleSelect = contentDiv.querySelector("#exampleSelect");
        const exampleDescriptionDiv = contentDiv.querySelector(
          "#exampleDescription"
        );
        const loadExampleButton =
          contentDiv.querySelector("#loadExampleButton");

        if (exampleSelect) {
          // Update the description when the selection changes.
          exampleSelect.addEventListener("change", () => {
            const selectedValue = exampleSelect.value;
            const selectedExample = examples.find(
              (ex) => ex.name === selectedValue
            );
            if (selectedExample) {
              exampleDescriptionDiv.innerHTML = selectedExample.description;
            } else {
              exampleDescriptionDiv.innerHTML = "";
            }
          });
          // Trigger the change event immediately to load the description of the first example.
          exampleSelect.dispatchEvent(new Event("change"));
        }

        if (loadExampleButton) {
          loadExampleButton.addEventListener("click", () => {
            const selectedValue = exampleSelect.value;
            const selectedExample = examples.find(
              (ex) => ex.name === selectedValue
            );
            if (selectedExample) {
              loadExample(selectedExample);
              closePopup();
            } else {
              alert("Please select an example");
            }
          });
        }
        break;

      case "Instructions":
        contentDiv.innerHTML = instructionsHTML;
        break;

      case "About":
        contentDiv.innerHTML = aboutHTML;
        break;
    }
  }

  // Expose the openPopup function globally.
  function openPopup() {
    overlay.classList.remove("hidden");
    loadTab("Settings"); // default to settings
  }

  function closePopup() {
    overlay.classList.add("hidden");
  }

  closeButton.addEventListener("click", closePopup);

  // Close the popup if the user clicks the background.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup();
    }
  });

  // Set up tab clicks.
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      loadTab(t.dataset.tab);
    });
  });

  // Update the loadExample function so that it accepts an example object.
  async function loadExample(example) {
    let fileName;
    if (typeof example === "object" && example.file) {
      fileName = example.file;
    } else if (typeof example === "string") {
      // Fallback for the old format
      fileName = example.replace(/\s+/g, "") + ".csv";
    } else {
      console.error("Invalid example input");
      return;
    }
    const url = `./examples/${fileName}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        alert("Failed to load " + url);
        return;
      }
      const text = await resp.text();
      // Parse as CSV
      const data = fromCSV(text);
      // Clear grid
      cellsData = {};
      // Populate the grid
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c];
          if (val.trim()) {
            const rowIndex = r + 1;
            const colIndex = c + 1;
            const key = `R${rowIndex}C${colIndex}`;
            cellsData[key] = val;
          }
        }
      }
      // Re-parse & format the grid
      parseAndFormatGrid();
    } catch (err) {
      console.error(err);
      alert("Error loading example: " + err);
    }
  }
})();

/*******************************************************
 * patterns.js
 *
 * Defines a flexible system for describing "structures"
 * (Cell Patterns, Cell Cluster Patterns, Block Patterns, etc.)
 * along with parse and format routines.
 *******************************************************/

PatternsManager = (function () {
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
      const val = cellsData["R" + row + "C" + col] || "";
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

/****************************************************
 * parsing.js
 *
 * 1) We define a single "Container" class (no duplicates).
 * 2) We define getContainersJS(...) which implements your
 *    Linqpad "GetContainers" logic.
 * 3) We identify blocks by calling getContainersJS(filledCells,2,...).
 * 4) For each block, we identify cell-clusters by calling
 *    getContainersJS(block.canvasCells,1,...).
 * 5) We fill in Treet logic for block joins => locked/linked, etc.
 * 6) Finally, we define parseAndFormatGrid as a global function on
 *
 * ***IMPORTANT***: Load this file before script.js or
 *    any file that calls parseAndFormatGrid.
 ****************************************************/

/****************************************************
 *  GLOBAL ARRAYS that script.js expects:
 ****************************************************/
let blockJoins = [];
let blockClusters = [];

/****************************************************
 * parseAndFormatGrid (global)
 ****************************************************/
function parseAndFormatGrid() {
  // Reset references (script.js uses these too)
  cellToBlockMap = {};
  blockList = [];
  blockJoins = [];
  blockClusters = [];

  // 1) Gather all "filledCells" from cellsData
  const filledCells = [];
  for (let key in cellsData) {
    const val = cellsData[key];
    if (val && val.trim() !== "") {
      let m = key.match(/R(\d+)C(\d+)/);
      if (m) {
        filledCells.push({
          row: parseInt(m[1]),
          col: parseInt(m[2]),
          key,
        });
      }
    }
  }

  // 2) Clear old formatting
  clearFormatting();

  // 3) Build "blocks" by getContainersJS(...) with expand=2
  const blockContainers = getContainersJS(
    filledCells,
    2,
    numberOfRows,
    numberOfColumns
  );

  // Convert each container => a Treet "Block"
  blockList = blockContainers.map((cont) => {
    // Build a block object
    const block = {
      canvasCells: cont.filledPoints.map((pt) => ({
        row: pt.row,
        col: pt.col,
      })),
      emptyCanvasCells: [],
      emptyClusterCells: [],
      cellClusters: [],
      borderCells: [],
      frameCells: [],
      topRow: cont.topRow,
      bottomRow: cont.bottomRow,
      leftCol: cont.leftColumn,
      rightCol: cont.rightColumn,
    };
    // populate cellToBlockMap for each filled cell
    for (let pt of block.canvasCells) {
      const k = `${pt.row},${pt.col}`;
      cellToBlockMap[k] = block;
    }
    return block;
  });

  // 4) finalize each block => do sub-lumps for cell clusters
  for (let b of blockList) {
    finalizeBlock(b);
  }

  // 5) block joins => locked/linked
  populateBlockJoins();

  // 6) block clusters => BFS on blockJoins
  populateBlockClusters();

  // 6b) find structural patterns
  // PatternsManager.parseAll(filledCells, blockList);

  // 7) final styling
  applyBlockStyles(filledCells);
}

/****************************************************
 * finalizeBlock(b)
 *   - bounding box => emptyCanvasCells
 *   - cellClusters => getContainersJS(b.canvasCells,1,...)
 *   - find cluster-empty cells => bounding box
 *   - border/frame => getOutlineCells
 ****************************************************/
function finalizeBlock(b) {
  // bounding box => emptyCanvasCells
  const fillSet = new Set(b.canvasCells.map((pt) => `${pt.row},${pt.col}`));
  for (let r = b.topRow; r <= b.bottomRow; r++) {
    for (let c = b.leftCol; c <= b.rightCol; c++) {
      const k = `${r},${c}`;
      if (!fillSet.has(k)) {
        b.emptyCanvasCells.push({ row: r, col: c });
        cellToBlockMap[k] = b;
      }
    }
  }

  // find sub-lumps of filled => cell clusters with expand=1
  const clusterContainers = getContainersJS(
    b.canvasCells,
    1,
    numberOfRows,
    numberOfColumns
  );
  // each container => topRow, leftCol, bottomRow, rightCol, filledPoints

  // convert each container => array of {row,col}
  b.cellClusters = clusterContainers.map((cont) =>
    cont.filledPoints.map((p) => ({ row: p.row, col: p.col }))
  );

  // find cluster-empty => for each cluster bounding box
  b.emptyClusterCells = [];
  for (let cluster of b.cellClusters) {
    let minR = Math.min(...cluster.map((p) => p.row));
    let maxR = Math.max(...cluster.map((p) => p.row));
    let minC = Math.min(...cluster.map((p) => p.col));
    let maxC = Math.max(...cluster.map((p) => p.col));
    for (let rr = minR; rr <= maxR; rr++) {
      for (let cc = minC; cc <= maxC; cc++) {
        if (!cluster.some((pt) => pt.row === rr && pt.col === cc)) {
          // if not in cellsData => cluster-empty
          if (!cellsData[`R${rr}C${cc}`]) {
            b.emptyClusterCells.push({ row: rr, col: cc });
          }
        }
      }
    }
  }

  // border=> getOutline(1), frame=> getOutline(2)
  b.borderCells = getOutlineCells(
    b.topRow,
    b.bottomRow,
    b.leftCol,
    b.rightCol,
    1,
    cellToBlockMap,
    b
  );
  b.frameCells = getOutlineCells(
    b.topRow,
    b.bottomRow,
    b.leftCol,
    b.rightCol,
    2,
    cellToBlockMap,
    b
  );
}

/****************************************************
 * getContainersJS
 *   JavaScript version of your Linqpad "GetContainers"
 ****************************************************/
function getContainersJS(filledPoints, expandOutlineBy, rowCount, colCount) {
  let containers = [];
  let overlappedPoints = [];
  let remainingPoints = [...filledPoints];

  for (let cell of filledPoints) {
    // skip if we've already merged it
    if (
      overlappedPoints.some((p) => p.row === cell.row && p.col === cell.col)
    ) {
      continue;
    }

    // create a container from this point
    let tempContainer = createContainerFromPoint(cell);
    let tempExpanded = tempContainer;

    let allCellsOverlappingThisContainer = [];
    let cellsOverlappingThisContainer = [];

    // (A) Merge other FILLed points that overlap the expanded bounding box
    do {
      let expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      tempExpanded = expanded;

      // find any other points that overlap
      cellsOverlappingThisContainer = remainingPoints.filter((p) => {
        if (p === cell) return false;
        if (
          allCellsOverlappingThisContainer.some(
            (pp) => pp.row === p.row && pp.col === p.col
          )
        ) {
          return false;
        }
        let singleC = createContainerFromPoint(p);
        return expanded.overlaps(singleC);
      });

      if (cellsOverlappingThisContainer.length > 0) {
        overlappedPoints.push(...cellsOverlappingThisContainer);

        // unify bounding box
        let minR = Math.min(
          tempContainer.topRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        let maxR = Math.max(
          tempContainer.bottomRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        let minC = Math.min(
          tempContainer.leftColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );
        let maxC = Math.max(
          tempContainer.rightColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );

        tempContainer.topRow = minR;
        tempContainer.bottomRow = maxR;
        tempContainer.leftColumn = minC;
        tempContainer.rightColumn = maxC;

        // unify filledPoints
        tempContainer.filledPoints.push(...cellsOverlappingThisContainer);
        allCellsOverlappingThisContainer.push(...cellsOverlappingThisContainer);
      }
    } while (cellsOverlappingThisContainer.length > 0);

    // (B) Merge repeatedly with EXISTING containers
    let mergedSomething;
    do {
      mergedSomething = false;

      // see which containers overlap our tempContainer
      let overlappedExisting = containers.filter((cc) =>
        tempExpanded.overlaps(cc)
      );

      if (overlappedExisting.length > 0) {
        mergedSomething = true;
        // unify with each overlapped container
        for (let oc of overlappedExisting) {
          // remove oc from containers
          containers = containers.filter((xx) => xx !== oc);

          // unify bounding box
          tempContainer.topRow = Math.min(tempContainer.topRow, oc.topRow);
          tempContainer.bottomRow = Math.max(
            tempContainer.bottomRow,
            oc.bottomRow
          );
          tempContainer.leftColumn = Math.min(
            tempContainer.leftColumn,
            oc.leftColumn
          );
          tempContainer.rightColumn = Math.max(
            tempContainer.rightColumn,
            oc.rightColumn
          );

          // unify filledPoints
          tempContainer.filledPoints.push(...oc.filledPoints);
        }
        tempExpanded = tempContainer.expandOutlineBy(
          expandOutlineBy,
          rowCount,
          colCount
        );
      }
      // after merging, we loop again to see if the bigger bounding box
      // overlaps another container we haven't merged with yet
    } while (mergedSomething);

    // now that we've merged with everything possible, push the final container
    containers.push(tempContainer);
  }

  // sort or do whatever you normally do
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  return containers;
}

/****************************************************
 * Container class to match your C# approach
 ****************************************************/
class Container {
  constructor(top, left, bottom, right) {
    this.topRow = top;
    this.leftColumn = left;
    this.bottomRow = bottom;
    this.rightColumn = right;
    this.filledPoints = [];
  }

  expandOutlineBy(expand, rowCount, colCount) {
    const newTop = Math.max(1, this.topRow - expand);
    const newLeft = Math.max(1, this.leftColumn - expand);
    const newBottom = Math.min(rowCount, this.bottomRow + expand);
    const newRight = Math.min(colCount, this.rightColumn + expand);

    let c = new Container(newTop, newLeft, newBottom, newRight);
    c.filledPoints = [...this.filledPoints];
    return c;
  }

  overlaps(other) {
    if (this.topRow > other.bottomRow) return false;
    if (other.topRow > this.bottomRow) return false;
    if (this.leftColumn > other.rightColumn) return false;
    if (other.leftColumn > this.rightColumn) return false;
    return true;
  }
}

function createContainerFromPoint(pt) {
  let c = new Container(pt.row, pt.col, pt.row, pt.col);
  c.filledPoints.push(pt);
  return c;
}

/****************************************************
 * populateBlockJoins => locked or linked
 ****************************************************/
function populateBlockJoins() {
  blockJoins = [];
  for (let i = 0; i < blockList.length; i++) {
    for (let j = i + 1; j < blockList.length; j++) {
      let A = blockList[i];
      let B = blockList[j];
      if (
        !containersOverlap(
          A.frameCells,
          B.frameCells,
          A.borderCells,
          B.borderCells
        )
      ) {
        continue;
      }
      let join = {
        blocks: [A, B],
        type: "linked",
        linkedCells: [],
        lockedCells: [],
        allJoinedCells: [],
      };
      let ff = overlapPoints(A.frameCells, B.frameCells);
      let bfAB = overlapPoints(A.borderCells, B.frameCells);
      let bfBA = overlapPoints(A.frameCells, B.borderCells);
      let locked = deduplicatePoints([...bfAB, ...bfBA]);
      let linked = ff;
      if (locked.length > 0) {
        join.type = "locked";
        join.lockedCells = locked;
        join.linkedCells = linked;
      } else {
        join.type = "linked";
        join.linkedCells = linked;
      }
      join.allJoinedCells = deduplicatePoints([...locked, ...linked]);
      if (join.allJoinedCells.length > 0) {
        blockJoins.push(join);
      }
    }
  }
}

/****************************************************
 * populateBlockClusters => BFS on blockJoins
 ****************************************************/
function populateBlockClusters() {
  let used = new Set();
  for (let block of blockList) {
    if (used.has(block)) continue;
    let clusterBlocks = [];
    let clusterJoins = [];
    gatherCluster(block, clusterBlocks, clusterJoins);

    let allCanvas = [];
    clusterBlocks.forEach((b) => {
      allCanvas.push(...b.canvasCells);
    });
    let minR = Math.min(...allCanvas.map((pt) => pt.row));
    let maxR = Math.max(...allCanvas.map((pt) => pt.row));
    let minC = Math.min(...allCanvas.map((pt) => pt.col));
    let maxC = Math.max(...allCanvas.map((pt) => pt.col));

    let linkedAll = [];
    let lockedAll = [];
    clusterJoins.forEach((jn) => {
      linkedAll.push(...jn.linkedCells);
      lockedAll.push(...jn.lockedCells);
    });
    let mergedLinked = deduplicatePoints(linkedAll);
    let mergedLocked = deduplicatePoints(lockedAll);

    blockClusters.push({
      blocks: clusterBlocks,
      blockJoins: clusterJoins,
      clusterCanvas: { top: minR, left: minC, bottom: maxR, right: maxC },
      linkedCells: mergedLinked,
      lockedCells: mergedLocked,
    });
    clusterBlocks.forEach((b) => used.add(b));
  }
}

function gatherCluster(start, clusterBlocks, clusterJoins) {
  let queue = [start];
  let visited = new Set();
  while (queue.length) {
    let blk = queue.shift();
    if (visited.has(blk)) continue;
    visited.add(blk);
    clusterBlocks.push(blk);

    let myJoins = blockJoins.filter((j) => j.blocks.includes(blk));
    for (let jn of myJoins) {
      if (!clusterJoins.includes(jn)) clusterJoins.push(jn);
      let other = jn.blocks.find((b) => b !== blk);
      if (!visited.has(other)) {
        queue.push(other);
      }
    }
  }
}

/****************************************************
 * applyBlockStyles(filledCells)
 ****************************************************/
function applyBlockStyles(filledCells) {
  for (let b of blockList) {
    for (let pt of b.emptyClusterCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("cluster-empty-cell");
    }
    // the rest => canvas-empty
    for (let r = b.topRow; r <= b.bottomRow; r++) {
      for (let c = b.leftCol; c <= b.rightCol; c++) {
        let key = `R${r}C${c}`;
        if (!cellsData[key]) {
          let td = getCellElement(r, c);
          if (td && !td.classList.contains("cluster-empty-cell")) {
            td.classList.add("canvas-empty-cell");
          }
        }
      }
    }
  }

  // locked & linked
  for (let bc of blockClusters) {
    for (let pt of bc.lockedCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("locked-cell");
    }
    for (let pt of bc.linkedCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td && !td.classList.contains("locked-cell")) {
        td.classList.add("linked-cell");
      }
    }
  }

  // fill text for actual filled
  for (let fc of filledCells) {
    let td = getCellElement(fc.row, fc.col);
    if (td) {
      td.textContent = cellsData[fc.key];
      td.classList.add("canvas-cell");
    }
  }

  // re-apply border/frame
  for (let b of blockList) {
    for (let pt of b.borderCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("border-cell");
    }
    for (let pt of b.frameCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("frame-cell");
    }
  }
}

/****************************************************
 * getOutlineCells => border/frame expansions
 ****************************************************/
function getOutlineCells(
  top,
  bottom,
  left,
  right,
  expandBy,
  cellMap,
  currentBlock
) {
  let outline = [];
  let rowCount = numberOfRows;
  let columnCount = numberOfColumns;

  // Top
  if (top - expandBy >= 1) {
    let cols = Array.from(
      {
        length:
          Math.min(right + expandBy, columnCount) -
          Math.max(left - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(left - expandBy, 1) + i
    );
    let rows = Array(cols.length).fill(top - expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })));
  }

  // Right
  if (right + expandBy <= columnCount) {
    let rows = Array.from(
      {
        length:
          Math.min(bottom + expandBy, rowCount) -
          Math.max(top - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(top - expandBy, 1) + i
    );
    let cols = Array(rows.length).fill(right + expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })));
  }

  // Bottom
  if (bottom + expandBy <= rowCount) {
    let cols = Array.from(
      {
        length:
          Math.min(right + expandBy, columnCount) -
          Math.max(left - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(left - expandBy, 1) + i
    );
    let rows = Array(cols.length).fill(bottom + expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })).reverse());
  }

  // Left
  if (left - expandBy >= 1) {
    let rows = Array.from(
      {
        length:
          Math.min(bottom + expandBy, rowCount) -
          Math.max(top - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(top - expandBy, 1) + i
    );
    let cols = Array(rows.length).fill(left - expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })).reverse());
  }

  // Remove duplicates and return
  return Array.from(new Set(outline.map(JSON.stringify)), JSON.parse);
}

/****************************************************
 * areCanvasesWithinProximity => merges blocks, distance=2
 ****************************************************/
function areCanvasesWithinProximity(a, b, proximity) {
  let vert = 0;
  if (a.bottomRow < b.topRow) {
    vert = b.topRow - a.bottomRow - 1;
  } else if (b.bottomRow < a.topRow) {
    vert = a.topRow - b.bottomRow - 1;
  } else {
    vert = 0;
  }
  let horiz = 0;
  if (a.rightCol < b.leftCol) {
    horiz = b.leftCol - a.rightCol - 1;
  } else if (b.rightCol < a.leftCol) {
    horiz = a.leftCol - b.rightCol - 1;
  } else {
    horiz = 0;
  }
  return vert < proximity && horiz < proximity;
}

/****************************************************
 * containersOverlap => locked vs linked
 ****************************************************/
function containersOverlap(frameA, frameB, borderA, borderB) {
  let ff = overlapPoints(frameA, frameB);
  let ab = overlapPoints(borderA, frameB);
  let ba = overlapPoints(frameA, borderB);
  return ff.length > 0 || ab.length > 0 || ba.length > 0;
}

/****************************************************
 * overlapPoints(listA,listB)
 ****************************************************/
function overlapPoints(listA, listB) {
  const setB = new Set(listB.map((p) => `${p.row},${p.col}`));
  let out = [];
  for (let p of listA) {
    let k = `${p.row},${p.col}`;
    if (setB.has(k)) {
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * deduplicatePoints
 ****************************************************/
function deduplicatePoints(arr) {
  let used = new Set();
  let out = [];
  for (let p of arr) {
    let k = `${p.row},${p.col}`;
    if (!used.has(k)) {
      used.add(k);
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * getNeighbors(r,c,dist=1)
 * => up to 8 directions
 ****************************************************/
function getNeighbors(r, c, dist) {
  let out = [];
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr;
      let nc = c + dc;
      if (nr >= 1 && nr <= numberOfRows && nc >= 1 && nc <= numberOfColumns) {
        out.push({ row: nr, col: nc });
      }
    }
  }
  return out;
}

/****************************************************
 * clearFormatting
 ****************************************************/
function clearFormatting() {
  const allTds = document.querySelectorAll("#spreadsheet td");
  allTds.forEach((td) => {
    td.classList.remove(
      "selected",
      "canvas-cell",
      "empty-cell-cluster",
      "cluster-empty-cell",
      "canvas-empty-cell",
      "border-cell",
      "frame-cell",
      "underscore-cell",
      "normal-cell",
      "locked-cell",
      "linked-cell"
    );
    let r = td.getAttribute("data-row");
    let c = td.getAttribute("data-col");
    let key = `R${r}C${c}`;
    if (cellsData[key]) {
      td.textContent = cellsData[key];
    } else {
      td.textContent = "";
    }
  });
}

/******************************************************
 * treetNested.js
 *
 * Replicates the Excel "nested CSV in a cell" approach.
 ******************************************************/

// We'll define some top-level variables or references:

// Markers / patterns used for nested levels:
//  - A cell that starts with "," indicates it has an embedded grid.
//  - The first cell (R1C1) can contain '^' plus CSV for parent “wrapper.”
//  - When we enter a nested cell, that cell’s contents are replaced with a marker like `<<)1(>>`.
//  - The top cell has CSV with placeholders to embed deeper levels, etc.

/******************************************************
 * enterNestedCell(selectedCell)
 ******************************************************/
function enterNestedCell(selectedCell) {
  // 1) If the cell is empty, put a comma.
  let key = getCellKey(selectedCell);
  if (!cellsData[key] || cellsData[key].trim() === "") {
    cellsData[key] = ",";
    selectedCell.textContent = ",";
  }

  // 2) Check if the first character is a comma => signals a nested grid.
  if (!cellsData[key].startsWith(",")) {
    return; // Not a nestable cell; do nothing.
  }

  // 3) Grab the “wrapper” in the first cell (R1C1), if present
  let firstCellKey = "R1C1";
  let csvWrapper = cellsData[firstCellKey] || "";

  // 4) Determine current nested depth. If first cell starts with '^', it’s the top-level wrapper.
  let currentDepth = 0;
  if (csvWrapper.startsWith("^")) {
    // Attempt to see if there's a marker like `^<<)2(>>...`
    // Or parse from the formula in your original Excel code
    // For simplicity, we can store the depth in the string if we want
    currentDepth = getDepthFromWrapper(csvWrapper);
  }

  // 5) Convert *this* cell’s contents from CSV => array
  let rawNestedCsv = cellsData[key];
  let nestedArray = fromCSV(rawNestedCsv); // from csv.js

  // 6) Replace that cell’s content with a simple marker for the new nest:
  let newDepth = currentDepth + 1;
  cellsData[key] = `<<)${newDepth}(>>`;
  selectedCell.textContent = `<<)${newDepth}(>>`;

  // 7) Clear out the wrapper from R1C1 if we are deeper than the initial level
  if (currentDepth > 0) {
    cellsData[firstCellKey] = "";
  }

  // 8) Convert the *entire* existing sheet to CSV
  //    (so we can embed it as the new parent CSV in R1C1).
  let sheetCsv = sheetToCsv(false);

  // 9) Now wipe the entire sheet
  cellsData = {};

  // 10) Put the nestedArray content as the “new sheet”
  arrayToSheet(nestedArray);

  // 11) Put the wrapper CSV in the new R1C1
  if (currentDepth === 0) {
    // This is the first time we nested; store the old sheet in R1C1 as '^' + CSV
    cellsData[firstCellKey] = "^" + sheetCsv;
  } else {
    // We are going deeper inside an already nested structure.
    // In the original code, we look for the marker in the wrapper
    // and replace it with the new sub-CSV plus a nested marker.
    let newCsvWrapper = replaceMarkerInWrapper(
      csvWrapper,
      currentDepth,
      sheetCsv
    );
    cellsData[firstCellKey] = newCsvWrapper;
  }

  // 12) Re-parse and re-render
  parseAndFormatGrid();

  // Optionally, set focus to something like R1C2
  let newFocusCell = document.querySelector(
    "#spreadsheet td[data-row='1'][data-col='2']"
  );
  if (newFocusCell) {
    clearSelection();
    newFocusCell.classList.add("selected");
    selectedCells = [newFocusCell];
    selectedCell = newFocusCell;
  }
}

/******************************************************
 * leaveNestedCell()
 ******************************************************/
function leaveNestedCell() {
  // 1) Check if we’re actually in a nested sheet by seeing if R1C1 starts with '^'.
  let firstCellKey = "R1C1";
  let currentParentCsv = cellsData[firstCellKey] || "";

  if (!currentParentCsv.startsWith("^")) {
    // Not in a nested grid, so do nothing.
    return;
  }

  // 2) Determine nested depth
  let currentDepth = getDepthFromWrapper(currentParentCsv);
  if (currentDepth === 0) {
    // Means we can’t go up any further
    return;
  }

  // 3) Convert the entire *current* sheet to CSV so we can embed it back into the parent's marker.
  let currentSheetCsvWithoutParentCell = sheetToCsv(true);
  if (!currentSheetCsvWithoutParentCell.trim()) {
    currentSheetCsvWithoutParentCell = ","; // Ensure there's at least one empty cell
  }

  // 4) Clear out the entire grid before restoring the parent
  cellsData = {};

  // 5) Restore parent grid with updated nested content
  if (currentDepth > 1) {
    // Look in the parent CSV (in cell R1C1)
    // and grab out the part of that CSV that represents the next highest level
    // So in the example below, if the currentDepth is 2 then grab out all
    // the CSV between <<(1) and (1)>> since that is the CSV for the next level
    // ^,,,
    // ,,,
    // ,,a,
    // ,,,<<(1),,,
    // ,,,
    // ,,b,
    // ,,,<<)2(>>(1)>>
    let nextHighestGridDepth = currentDepth - 1;
    let nextHighestGridFirstSplit = currentParentCsv.split(
      `(${nextHighestGridDepth})>>`
    )[0]; // Get everything before "(depth)>>"
    let nextHighestGridAsCsvWithMarker = nextHighestGridFirstSplit.split(
      `<<(${nextHighestGridDepth})`
    )[1]; // Get everything after "<<(depth)"

    // In our example we now have this CSV for the next grid to replace the current grid
    // ,,,
    // ,,,
    // ,,b,
    // ,,,<<)2(>>

    // but before we can use this CSV to replace the contents of the current grid (level 2)
    // with the contents of the CSV from level 1 (from our example above)
    // we have to replace the <<)2(>> in that CSV with the current grid (level 2) as CSV

    // so first define <<)2(>>
    let currentGridLevelMarker = `<<)${currentDepth}(>>`;
    // then we need to take the current sheets CSV without the parent cell
    // and replace any quotes with double quotes (per the CSV standard)
    let currentSheetCsvWithoutParentCellEscaped =
      currentSheetCsvWithoutParentCell.replace(/"/g, `""`); // Escape double quotes
    // now we need to wrap that
    let currentSheetCsvWithoutParentCellEscapedWrappedInQuotes = `"${currentSheetCsvWithoutParentCellEscaped}"`; // Wrap the whole thing in quotes

    // now we need to replace the marker in the nextHighestGridAsCsvWithMarker
    let nextHighestGridAsCsvWithMarkerReplaced =
      nextHighestGridAsCsvWithMarker.replace(
        currentGridLevelMarker,
        currentSheetCsvWithoutParentCellEscapedWrappedInQuotes
      );

    // In our example we now have this CSV for the next grid to replace the current grid
    // notice the <<)2(>> has now ben replaced with the current grid converted to CSV
    // ,,,
    // ,,,
    // ,,b,
    // ,,,",c"

    // Now we are almost ready to replace the contents of the current level grid
    // with the next level grid. However, we need to add in the new parent CSV to our new
    // next level grid

    // So first create that next level parent by replacing (from the parent CSV from our example)

    // <<(1),,,
    // ,,,
    // ,,b,
    // ,,,<<)2(>>(1)>>

    //with just

    // <<)1(>>
    let beginningOfNextInParent = `<<(${nextHighestGridDepth})`;
    let endOfNextInParent = `(${nextHighestGridDepth})>>`;
    let nextInParent = `${beginningOfNextInParent}${nextHighestGridAsCsvWithMarker}${endOfNextInParent}`;
    let newNextInParent = `<<)${nextHighestGridDepth}(>>`;
    let currentParentCsvWithNewNext = currentParentCsv.replace(
      nextInParent,
      newNextInParent
    );
    // Make sure we wrap the new parent cell in quotes
    let nextHighestNestedGridParent = `"${currentParentCsvWithNewNext}"`;

    // Now just add the new parent cell on to the beginning of the newly constructed
    // next level CSV
    let nextLevelCsv = `${nextHighestNestedGridParent}${nextHighestGridAsCsvWithMarkerReplaced}`;

    // Convert back to an array and display
    let parentArray = fromCSV(nextLevelCsv);
    arrayToSheet(parentArray);
  } else {
    // Leaving the top-level nested sheet, reintegrate the CSV back into R1C1's placeholder
    parentCsv = embedCurrentCsvInWrapper(
      currentParentCsv,
      currentDepth,
      currentSheetCsvWithoutParentCell
    );

    // Remove the leading '^' to return to the base grid
    let strippedParentCsv = removeCaret(parentCsv);

    // Convert back to an array and display
    let parentArray = fromCSV(strippedParentCsv);
    arrayToSheet(parentArray);
  }

  // 6) Re-parse and re-render the grid
  parseAndFormatGrid();

  // 7) Optionally focus a certain cell (defaults to R1C2)
  let focusCell = document.querySelector(
    "#spreadsheet td[data-row='1'][data-col='2']"
  );
  if (focusCell) {
    clearSelection();
    focusCell.classList.add("selected");
    selectedCells = [focusCell];
    selectedCell = focusCell;
  }
}

/***********************************************
 * Helpers used by the above two functions
 ***********************************************/

/**
 * Convert the entire grid to CSV
 */
function sheetToCsv(ignoreParentCell) {
  // Build a 2D array from cellsData:
  // 1) Find max row & column in cellsData
  let maxRow = 0,
    maxCol = 0;

  for (let key in cellsData) {
    let m = key.match(/R(\d+)C(\d+)/);
    if (!m) continue;

    let r = parseInt(m[1]);
    let c = parseInt(m[2]);

    // Ignore R1C1 if it starts with "^"
    if (r === 1 && c === 1 && cellsData[key].startsWith("^")) {
      continue;
    }

    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;
  }

  // 2) Construct a 2D array
  let arr = [];
  for (let r = 0; r < maxRow; r++) {
    arr[r] = new Array(maxCol).fill("");
  }

  // 3) Fill it from cellsData
  for (let key in cellsData) {
    let m = key.match(/R(\d+)C(\d+)/);
    if (!m) continue;

    let rr = parseInt(m[1]) - 1;
    let cc = parseInt(m[2]) - 1;

    if (ignoreParentCell) {
      // Ignore R1C1 if it starts with "^"
      if (rr === 0 && cc === 0 && cellsData[key].startsWith("^")) {
        continue;
      }
    }

    arr[rr][cc] = cellsData[key];
  }

  // 4) Convert to CSV
  return toCSV(arr);
}

/**
 * Replace the entire sheet with the data from a 2D array
 */
function arrayToSheet(arr2D) {
  // Clear out cellsData:
  cellsData = {};
  for (let r = 0; r < arr2D.length; r++) {
    for (let c = 0; c < arr2D[r].length; c++) {
      let val = arr2D[r][c];
      if (val && val.trim() !== "") {
        let key = `R${r + 1}C${c + 1}`;
        cellsData[key] = val;
      }
    }
  }
}

/**
 * Example: parse something like '^<<)2(>>someCSV...'
 * and return numeric depth = 2
 */
function getDepthFromWrapper(str) {
  // You can store the depth explicitly, or parse from parentheses.
  // This is up to you. For simplicity, let’s find <<)N(>> if it exists.
  // If none, depth = 0
  let match = str.match(/<<\)(\d+)\(>>/);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Otherwise return 0 or 1 depending on how you design it
  return 0;
}

function removeCaret(str) {
  // If it starts with '^', remove it.
  if (str.startsWith("^")) {
    return str.substring(1);
  }
  return str;
}

/**
 * Insert the child CSV into the parent's marker.
 * (Mirrors the original "Replace(csvWrapper, '<<)depth(>>', '<<(depth)childCsv(depth)>>'" logic)
 */
function replaceMarkerInWrapper(csvWrapper, oldDepth, newSheetCsv) {
  // Example approach:
  let marker = `<<)${oldDepth}(>>`;
  let replacement = `<<(${oldDepth})${newSheetCsv}(${oldDepth})>>`;
  return csvWrapper.replace(marker, replacement);
}

/**
 * If we are multiple levels deep, replace the marker `<<)depth(>>`
 * with the nested CSV while preserving correct formatting.
 */
function replaceDeepMarkerInWrapper(wrapper, depth, childCsv) {
  // Ensure childCsv is properly escaped (quotes, newlines, etc.)
  let escapedCsv = childCsv.replace(/"/g, '""'); // Escape double quotes

  // Define the marker that we are looking for
  let marker = `<<)${depth}(>>`;

  // Define the correct replacement, ensuring it keeps the structure intact
  let replacement = `<<)${depth}(>>${escapedCsv}(>>${depth})>>`;

  // Perform the replacement
  let updatedWrapper = wrapper.replace(marker, replacement);

  // If the replacement didn't happen, log an error for debugging
  if (updatedWrapper === wrapper) {
    console.warn(`Marker <<)${depth}(>> not found in wrapper:`, wrapper);
  }

  return updatedWrapper;
}

/**
 * Rewrite the '^...' string so that the depth is decreased by 1
 */
function rewriteWrapperDepth(str, newDepth) {
  // If we had '^<<)3(>>someCSV', we want '^<<)2(>>someCSV', etc.
  return str.replace(/<<\)\d+\(>>/, `<<)${newDepth}(>>`);
}

/**
 * Helper for final embedding once we get back to the top-level parent
 */
function embedCurrentCsvInWrapper(parentCsv, depth, childCsv) {
  // Escape double quotes inside the child CSV
  let escapedChildCsv = childCsv.replace(/"/g, '""');

  // Construct the replacement string (this is how the VBA works)
  let replacement = `"${escapedChildCsv}"`;

  // Replace the marker <<)depth(>> in the parent CSV with the new escaped child CSV
  let updatedParentCsv = parentCsv.replace(`<<)${depth}(>>`, replacement);

  // Log a warning if the marker was not found (useful for debugging)
  if (updatedParentCsv === parentCsv) {
    console.warn(`Marker <<)${depth}(>> not found in parent CSV:`, parentCsv);
  }

  return updatedParentCsv;
}

/**
 * Clear current selection
 */
function clearSelection() {
  if (!selectedCells) return;
  for (let cell of selectedCells) {
    cell.classList.remove("selected");
  }
  selectedCells = [];
  selectedCell = null;
}

function getCellKey(cell) {
  let r = cell.getAttribute("data-row");
  let c = cell.getAttribute("data-col");
  return `R${r}C${c}`;
}

/***********************************************
 * script.js - Merged version with mobile logic + new fixes
 ***********************************************/

/***********************************************
 * Global data structure so parsing.js can see it
 ***********************************************/
/***********************************************
 * Global data structure so parsing.js can see it
 ***********************************************/
const savedGridData = localStorage.getItem("savedGridData");

if (savedGridData) {
  // Detect delimiter (TSV = tab, CSV = comma)
  const delimiter = savedGridData.includes("\t") ? "\t" : ",";

  // Convert CSV/TSV into a 2D array
  const dataArray =
    delimiter === "\t" ? fromTSV(savedGridData) : fromCSV(savedGridData);

  // Convert 2D array into cellsData format
  cellsData = {};
  for (let r = 0; r < dataArray.length; r++) {
    for (let c = 0; c < dataArray[r].length; c++) {
      const val = dataArray[r][c];
      if (val.trim()) {
        const rowIndex = r + 1;
        const colIndex = c + 1;
        const key = `R${rowIndex}C${colIndex}`;
        cellsData[key] = val;
      }
    }
  }
} else {
  cellsData = {}; // Default to empty grid
}

/***********************************************
 * Configuration
 ***********************************************/
let NUMBER_OF_ROWS = 125;
let NUMBER_OF_COLUMNS = 100;
let ADDITIONAL_ROWS_COLUMNS = 50;

// Our default delimiter => "tab" for TSV but first check for a local storage value
currentDelimiter = localStorage.getItem("savedDelimiter") || "tab";

/***********************************************
 * For Treet parser references
 ***********************************************/
let cellToBlockMap = {};
let blockList = [];

// Keep track of total row/col counts
let numberOfRows = NUMBER_OF_ROWS;
let numberOfColumns = NUMBER_OF_COLUMNS;

// Selected cells
// Directly attach them to window
selectedCells = [];
selectedCell = null;
let isSelecting = false;
let startCell = null;
let endCell = null;

// Middle-click panning
let isMidPanning = false;
let midPanStartX = 0;
let midPanStartY = 0;
let midPanScrollLeft = 0;
let midPanScrollTop = 0;

// Mobile/touch
const PAN_THRESHOLD = 10;
let isTouchPanning = false;
let touchStartX = 0;
let touchStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;
let longPressTimeout = null;
let longPressDuration = 500; // how long before we consider it a long press
let isLongPressFired = false;
let isTouchSelecting = false;
let touchSelectStartCell = null;
const doubleTapDelay = 250;
let lastTapTime = 0;
let lastTapCell = null;
let isDraggingBlock = false;
let draggedBlock = null;
let draggedSelection = null;
let dragShadowCells = [];

// For resizing columns/rows
let isResizingCol = false;
let isResizingRow = false;
let startX, startY, startWidth, startHeight;
let resizerCol, resizerRow;

// DOM references
const spreadsheet = document.getElementById("spreadsheet");
const gridContainer = document.getElementById("gridContainer");
const inputBox = document.getElementById("inputBox");
const cellLabel = document.getElementById("cellLabel");
const sidePanel = document.getElementById("sidePanel");
// (If you had a "toggleSidePanelButton" in index.html uncommented, we’d reference it. Otherwise it's commented out.)
// const toggleSidePanelButton = document.getElementById("toggleSidePanel");

// NEW: For implementing cut/paste logic
let isCutMode = false;
let cutCellsData = null;

// For Shift+ArrowKey Selection
let selectionAnchor = null;

// NEW: Simple context menu for right-click copy (optional)
const contextMenu = document.createElement("div");
contextMenu.id = "customContextMenu";
contextMenu.style.position = "absolute";
contextMenu.style.display = "none";
contextMenu.style.background = "#eee";
contextMenu.style.border = "1px solid #999";
contextMenu.innerHTML = `
  <div style="padding:4px; cursor:pointer;" id="contextMenuCopy">Copy</div>
`;
document.body.appendChild(contextMenu);

/***********************************************
 * Generate Spreadsheet
 ***********************************************/
function generateSpreadsheet() {
  spreadsheet.innerHTML = "";

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Header row
  const headerRow = document.createElement("tr");

  // Blank selectAllCell
  const selectAllTh = document.createElement("th");
  selectAllTh.id = "selectAllCell";
  headerRow.appendChild(selectAllTh);

  for (let col = 1; col <= numberOfColumns; col++) {
    const th = document.createElement("th");
    th.setAttribute("data-col", col);
    th.textContent = col;

    // Column resizer
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    resizer.setAttribute("data-col", col);
    th.appendChild(resizer);

    headerRow.appendChild(th);
  }

  // + columns cell
  const addColumnTh = document.createElement("th");
  addColumnTh.id = "addColumnButton";
  addColumnTh.textContent = "+";
  headerRow.appendChild(addColumnTh);

  thead.appendChild(headerRow);
  spreadsheet.appendChild(thead);

  // Body
  for (let row = 1; row <= numberOfRows; row++) {
    const tr = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.setAttribute("data-row", row);
    rowHeader.textContent = row;

    const rowResizer = document.createElement("div");
    rowResizer.classList.add("resizer-row");
    rowResizer.setAttribute("data-row", row);
    rowHeader.appendChild(rowResizer);

    tr.appendChild(rowHeader);

    for (let col = 1; col <= numberOfColumns; col++) {
      const td = document.createElement("td");
      td.setAttribute("data-row", row);
      td.setAttribute("data-col", col);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  spreadsheet.appendChild(tbody);

  // The plus row
  const plusRow = document.createElement("tr");
  plusRow.id = "addRowButtonRow";
  plusRow.classList.add("plus-row");

  const plusTh = document.createElement("th");
  plusTh.id = "addRowButton";
  plusTh.textContent = "+";
  plusRow.appendChild(plusTh);

  for (let col = 1; col <= numberOfColumns; col++) {
    const td = document.createElement("td");
    plusRow.appendChild(td);
  }
  tbody.appendChild(plusRow);

  attachEventListeners();
}

generateSpreadsheet();

/***********************************************
 * Long Press on Select All => Move to R1C1
 ***********************************************/
const selectAllCell = document.getElementById("selectAllCell");

if (selectAllCell) {
  let longPressTimeout;

  selectAllCell.addEventListener("mousedown", (e) => {
    longPressTimeout = setTimeout(() => {
      moveSelectionToTopLeft();
    }, 500); // Adjust the delay if needed
  });

  selectAllCell.addEventListener("mouseup", () => {
    clearTimeout(longPressTimeout);
  });

  selectAllCell.addEventListener("mouseleave", () => {
    clearTimeout(longPressTimeout);
  });

  selectAllCell.addEventListener("touchstart", (e) => {
    longPressTimeout = setTimeout(() => {
      moveSelectionToTopLeft();
    }, 500);
  });

  selectAllCell.addEventListener("touchend", () => {
    clearTimeout(longPressTimeout);
  });

  selectAllCell.addEventListener("touchcancel", () => {
    clearTimeout(longPressTimeout);
  });
}

/***********************************************
 * Move Selection to R1C1 and Scroll
 ***********************************************/
function moveSelectionToTopLeft() {
  const targetCell = getCellElement(1, 1);
  if (targetCell) {
    clearSelection();
    targetCell.classList.add("selected");
    selectedCells = [targetCell];
    selectedCell = targetCell;
    inputBox.value = targetCell.textContent;
    updateCellLabel(targetCell);

    // Scroll the top-left part of the grid into view
    targetCell.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }
}

/***********************************************
 * attachEventListeners
 ***********************************************/

function attachEventListeners() {
  // "Select All" cell
  const selectAllCell = document.getElementById("selectAllCell");
  if (selectAllCell) {
    let longPressTimeout;
    let isLongPress = false;

    function startLongPressDetection() {
      isLongPress = false;
      longPressTimeout = setTimeout(() => {
        isLongPress = true;
        moveSelectionToTopLeft();
      }, 500); // Adjust long-press duration if needed
    }

    function cancelLongPressDetection() {
      clearTimeout(longPressTimeout);
    }

    selectAllCell.addEventListener("mousedown", (e) => {
      startLongPressDetection();
    });

    selectAllCell.addEventListener("mouseup", (e) => {
      cancelLongPressDetection();
      if (!isLongPress) {
        selectWholeGrid(); // Normal click behavior
      }
    });

    selectAllCell.addEventListener("mouseleave", cancelLongPressDetection);

    selectAllCell.addEventListener("touchstart", (e) => {
      startLongPressDetection();
    });

    selectAllCell.addEventListener("touchend", (e) => {
      cancelLongPressDetection();
      if (!isLongPress) {
        selectWholeGrid(); // Normal tap behavior
      }
    });

    selectAllCell.addEventListener("touchcancel", cancelLongPressDetection);
  }

  /***********************************************
   * Move Selection to Cell at R1C1 and Scroll
   ***********************************************/
  function moveSelectionToTopLeftCell() {
    const targetCell = document.querySelector("td[data-row='1'][data-col='1']");
    if (targetCell) {
      clearSelection();
      targetCell.classList.add("selected");
      selectedCells = [targetCell];
      selectedCell = targetCell;
      inputBox.value = targetCell.textContent;
      updateCellLabel(targetCell);

      // Scroll the top-left part of the grid into view
      targetCell.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  }

  /***********************************************
   * Default: Select the Whole Grid
   ***********************************************/
  function selectWholeGrid() {
    const firstCell = document.querySelector("td[data-row='1'][data-col='1']");
    const lastCell = document.querySelector(
      `td[data-row='${numberOfRows}'][data-col='${numberOfColumns}']`
    );
    if (firstCell && lastCell) {
      selectCells(firstCell, lastCell);
    }
  }

  // Add row
  const addRowButton = document.getElementById("addRowButton");
  if (addRowButton) {
    addRowButton.addEventListener("click", () => {
      addRows(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  // Add column
  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    addColumnButton.addEventListener("click", () => {
      addColumns(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  // If you have a toggleSidePanelButton, uncomment:
  /*
  if (toggleSidePanelButton) {
    toggleSidePanelButton.addEventListener("click", () => {
      sidePanel.classList.toggle("hidden");
      if (sidePanel.classList.contains("hidden")) {
        toggleSidePanelButton.textContent = "Show Side Panel";
      } else {
        toggleSidePanelButton.textContent = "Hide Side Panel";
      }
    });
  }
  */

  // Column/row resizing
  spreadsheet.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resizer")) {
      isResizingCol = true;
      resizerCol = e.target;
      startX = e.pageX;
      const col = resizerCol.getAttribute("data-col");
      // We can't directly do `querySelector(th[data-col='${col}'] )` with template literal incorrectly
      // We'll fix it:
      const th = spreadsheet.querySelector(`th[data-col='${col}']`);
      if (th) {
        startWidth = th.offsetWidth;
      }
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    } else if (e.target.classList.contains("resizer-row")) {
      isResizingRow = true;
      resizerRow = e.target;
      startY = e.pageY;
      const row = resizerRow.getAttribute("data-row");
      const rowTh = spreadsheet.querySelector(`th[data-row='${row}']`);
      if (rowTh) {
        startHeight = rowTh.offsetHeight;
      }
      document.body.style.cursor = "row-resize";
      e.preventDefault();
    }
  });
}

/***********************************************
 * Mouse interactions
 ***********************************************/
// Middle-click => pan, left-click => selection
spreadsheet.addEventListener("mousedown", (e) => {
  // Right-click context menu?
  if (e.button === 2) {
    // Only show context menu if we have some selected cells
    if (selectedCells.length > 0) {
      e.preventDefault();
      contextMenu.style.left = e.pageX + "px";
      contextMenu.style.top = e.pageY + "px";
      contextMenu.style.display = "block";
    }
    return;
  }

  if (e.button === 1) {
    // middle-click => panning
    isMidPanning = true;
    midPanStartX = e.clientX;
    midPanStartY = e.clientY;
    midPanScrollLeft = gridContainer.scrollLeft;
    midPanScrollTop = gridContainer.scrollTop;
    e.preventDefault();
    return;
  }

  if (e.button === 0) {
    // left-click => start selection
    let target = e.target;
    if (target.tagName === "TD" && !target.closest(".plus-row")) {
      selectionAnchor = target;
      isSelecting = true;
      startCell = target;
      selectCells(startCell, startCell);
      e.preventDefault();
    }
  }
});

spreadsheet.addEventListener("mousemove", (e) => {
  // Middle-click panning
  if (isMidPanning) {
    const dx = e.clientX - midPanStartX;
    const dy = e.clientY - midPanStartY;
    gridContainer.scrollLeft = midPanScrollLeft - dx;
    gridContainer.scrollTop = midPanScrollTop - dy;
    e.preventDefault();
    return;
  }

  // left-drag for multi selection
  if (isSelecting) {
    let target = e.target;
    if (target.tagName === "TD" && !target.closest(".plus-row")) {
      endCell = target;
      selectCells(startCell, endCell);
    }
  }
});

/***********************************************
 * Formula bar events
 ***********************************************/
inputBox.addEventListener("input", () => {
  if (!selectedCell) return;
  const key = getCellKey(selectedCell);
  selectedCell.textContent = inputBox.value;
  if (!inputBox.value.trim()) {
    delete cellsData[key];
  } else {
    cellsData[key] = inputBox.value;
  }
  parseAndFormatGrid();
});

// SHIFT+Enter => up, Enter => down, Tab => left/right
inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    // normal Enter => move down
    e.preventDefault();
    moveSelection(1, 0);
  } else if (e.key === "Enter" && e.shiftKey) {
    // SHIFT+Enter => move up
    e.preventDefault();
    moveSelection(-1, 0);
  } else if (e.key === "Tab") {
    // Tab => move right or left with shift
    e.preventDefault();
    if (e.shiftKey) moveSelection(0, -1);
    else moveSelection(0, 1);
  }
});

inputBox.addEventListener("focus", () => {
  // highlight the text
  setTimeout(() => {
    inputBox.select();
  }, 0);
});

inputBox.addEventListener("dblclick", () => {
  // place cursor at end
  const len = inputBox.value.length;
  inputBox.setSelectionRange(len, len);
});

/***********************************************
 * Right-click "Copy" button
 ***********************************************/
document.getElementById("contextMenuCopy").addEventListener("click", () => {
  if (selectedCells.length > 0) {
    handleCtrlC();
  }
  contextMenu.style.display = "none";
});

/***********************************************
 * Ctrl+X => cut
 ***********************************************/
function handleCtrlX() {
  if (!selectedCells.length) return;
  // Store the data for the eventual paste
  cutCellsData = selectedCells.map((cell) => {
    return {
      row: +cell.getAttribute("data-row"),
      col: +cell.getAttribute("data-col"),
      text: cell.textContent,
    };
  });
  isCutMode = true;

  // also copy to clipboard
  handleCtrlC();
  // (Visually, we haven't removed them from the grid yet,
  //  we remove them after user pastes.)
}

/***********************************************
 * Selecting cells
 ***********************************************/
function selectCells(cell1, cell2) {
  clearSelection();

  let r1 = +cell1.getAttribute("data-row");
  let c1 = +cell1.getAttribute("data-col");
  let r2 = +cell2.getAttribute("data-row");
  let c2 = +cell2.getAttribute("data-col");

  let minR = Math.min(r1, r2);
  let maxR = Math.max(r1, r2);
  let minC = Math.min(c1, c2);
  let maxC = Math.max(c1, c2);

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const td = getCellElement(r, c);
      if (td) {
        td.classList.add("selected");
        selectedCells.push(td);
      }
    }
  }

  if (selectedCells.length > 0) {
    selectedCell = getCellElement(minR, minC);
    if (selectedCell) {
      inputBox.value = selectedCell.textContent;
      updateCellLabel(selectedCell);
      if (!isMobileDevice()) {
        inputBox.focus();
      }
    }
  }
}

function clearSelection() {
  for (let cell of selectedCells) {
    cell.classList.remove("selected");
  }
  selectedCells = [];
  selectedCell = null;
}

function updateCellLabel(cell) {
  const r = cell.getAttribute("data-row");
  const c = cell.getAttribute("data-col");
  cellLabel.textContent = `R${r}C${c}`;
  cellLabel.setAttribute("title", `R${r}C${c}`);
}

function moveSelection(dr, dc) {
  selectionAnchor = null;
  if (!selectedCell) return;
  let row = +selectedCell.getAttribute("data-row");
  let col = +selectedCell.getAttribute("data-col");

  let newRow = row + dr;
  let newCol = col + dc;
  if (newRow < 1 || newCol < 1) return;

  if (newRow > numberOfRows) {
    addRows(newRow - numberOfRows);
  }
  if (newCol > numberOfColumns) {
    addColumns(newCol - numberOfColumns);
  }

  const nextCell = getCellElement(newRow, newCol);
  if (nextCell) {
    clearSelection();
    nextCell.classList.add("selected");
    selectedCells = [nextCell];
    selectedCell = nextCell;
    inputBox.value = nextCell.textContent;
    updateCellLabel(nextCell);
    if (!isMobileDevice()) {
      inputBox.focus();
    }

    // Scroll into view after movement
    selectedCell.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }
}

function deleteSelectedCells() {
  for (let cell of selectedCells) {
    let key = getCellKey(cell);
    cell.textContent = "";
    delete cellsData[key];
  }
  inputBox.value = "";
  parseAndFormatGrid();
}

/***********************************************
 * Add Rows/Cols
 ***********************************************/
function addRows(count) {
  let tbody = spreadsheet.querySelector("tbody");
  const plusRow = document.getElementById("addRowButtonRow");
  if (plusRow) {
    tbody.removeChild(plusRow);
  }

  for (let i = 0; i < count; i++) {
    numberOfRows++;
    let tr = document.createElement("tr");

    let th = document.createElement("th");
    th.setAttribute("data-row", numberOfRows);
    th.textContent = numberOfRows;

    let rowResizer = document.createElement("div");
    rowResizer.classList.add("resizer-row");
    rowResizer.setAttribute("data-row", numberOfRows);
    th.appendChild(rowResizer);

    tr.appendChild(th);

    for (let col = 1; col <= numberOfColumns; col++) {
      const td = document.createElement("td");
      td.setAttribute("data-row", numberOfRows);
      td.setAttribute("data-col", col);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  if (plusRow) {
    // reappend the plusRow
    while (plusRow.firstChild) {
      plusRow.removeChild(plusRow.firstChild);
    }
    const newPlusTh = document.createElement("th");
    newPlusTh.id = "addRowButton";
    newPlusTh.textContent = "+";
    plusRow.appendChild(newPlusTh);

    for (let col = 1; col <= numberOfColumns; col++) {
      plusRow.appendChild(document.createElement("td"));
    }
    tbody.appendChild(plusRow);
  }
}

function addColumns(count) {
  let theadRow = spreadsheet.querySelector("thead tr");
  let tbodyRows = spreadsheet.querySelectorAll("tbody tr");

  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    theadRow.removeChild(addColumnButton);
  }

  for (let i = 0; i < count; i++) {
    numberOfColumns++;
    let th = document.createElement("th");
    th.setAttribute("data-col", numberOfColumns);
    th.textContent = numberOfColumns;

    let cResizer = document.createElement("div");
    cResizer.classList.add("resizer");
    cResizer.setAttribute("data-col", numberOfColumns);
    th.appendChild(cResizer);

    theadRow.appendChild(th);

    tbodyRows.forEach((tr) => {
      if (tr.id === "addRowButtonRow") return;
      const rowHeader = tr.querySelector("th[data-row]");
      if (!rowHeader) return;
      const td = document.createElement("td");
      td.setAttribute("data-row", rowHeader.getAttribute("data-row"));
      td.setAttribute("data-col", numberOfColumns);
      tr.appendChild(td);
    });
  }

  if (addColumnButton) {
    theadRow.appendChild(addColumnButton);
  }

  const plusRow = document.getElementById("addRowButtonRow");
  if (plusRow) {
    while (plusRow.children.length > 1) {
      plusRow.removeChild(plusRow.lastChild);
    }
    for (let col = 1; col <= numberOfColumns; col++) {
      plusRow.appendChild(document.createElement("td"));
    }
  }
}

// For Ctrl+C in keydown
function handleCtrlC() {
  const text = copySelectedCells();
  if (!text) return;
  if (navigator.clipboard && isSecureContext) {
    navigator.clipboard.writeText(text).catch((err) => console.warn(err));
  } else {
    let temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
}

/***********************************************
 * Helper for removing original data on cut
 ***********************************************/
function removeCutSourceData(pasteRegion) {
  // Helper function to check if a cell (row, col) is in the paste region
  function isInPasteRegion(row, col, region) {
    return (
      row >= region.startRow &&
      row <= region.endRow &&
      col >= region.startCol &&
      col <= region.endCol
    );
  }

  for (let item of cutCellsData) {
    // Only remove data if this cell is not within the paste region.
    if (!isInPasteRegion(item.row, item.col, pasteRegion)) {
      delete cellsData[`R${item.row}C${item.col}`];
      const oldCell = getCellElement(item.row, item.col);
      if (oldCell) oldCell.textContent = "";
    }
  }
  isCutMode = false;
  cutCellsData = null;
}

/***********************************************
 * copySelectedCells
 ***********************************************/
function copySelectedCells() {
  if (!selectedCells.length) return "";
  // find bounding box
  let minR = Infinity,
    maxR = -Infinity;
  let minC = Infinity,
    maxC = -Infinity;

  for (let cell of selectedCells) {
    let r = +cell.getAttribute("data-row");
    let c = +cell.getAttribute("data-col");
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }

  // build array-of-arrays
  let arr2D = [];
  for (let row = minR; row <= maxR; row++) {
    let rowArr = [];
    for (let col = minC; col <= maxC; col++) {
      let td = getCellElement(row, col);
      let txt = "";
      if (td && selectedCells.includes(td)) {
        txt = td.textContent || "";
      }
      rowArr.push(txt);
    }
    arr2D.push(rowArr);
  }

  // now convert to CSV or TSV
  let out;
  if (currentDelimiter === "tab") {
    out = toTSV(arr2D);
  } else {
    out = toCSV(arr2D);
  }
  return out;
}

/***********************************************
 * Touch on mobile
 ***********************************************/
gridContainer.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1) return;
  let t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  scrollStartX = gridContainer.scrollLeft;
  scrollStartY = gridContainer.scrollTop;

  isTouchPanning = false;
  isLongPressFired = false;
  isTouchSelecting = false;
  isDraggingBlock = false;

  // If user holds for longPressDuration => handle long press
  longPressTimeout = setTimeout(() => {
    if (!isTouchPanning) {
      isLongPressFired = true;
      let target = document.elementFromPoint(t.clientX, t.clientY);
      handleLongPress(target);
    }
  }, longPressDuration);
});

gridContainer.addEventListener("touchmove", (e) => {
  if (e.touches.length !== 1) return;
  let t = e.touches[0];
  let dx = t.clientX - touchStartX;
  let dy = t.clientY - touchStartY;

  if (isDraggingBlock) {
    e.preventDefault();
    handleDragMove(t);
    return;
  }
  if (isTouchSelecting) {
    e.preventDefault();
    let target = document.elementFromPoint(t.clientX, t.clientY);
    if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
      selectCells(touchSelectStartCell, target);
    }
    return;
  }

  // Decide if user is panning
  if (!isTouchPanning) {
    if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) {
      isTouchPanning = true;
      clearTimeout(longPressTimeout);
    }
  }
  if (isTouchPanning) {
    e.preventDefault();
    gridContainer.scrollLeft = scrollStartX - dx;
    gridContainer.scrollTop = scrollStartY - dy;
  }
});

gridContainer.addEventListener("touchend", (e) => {
  clearTimeout(longPressTimeout);

  if (isDraggingBlock) {
    finalizeDrag();
    isDraggingBlock = false;
    return;
  }

  if (isTouchSelecting) {
    isTouchSelecting = false;
    return;
  }

  // If we haven't panned or long-pressed, check for single vs double tap
  if (!isLongPressFired && !isTouchPanning) {
    let now = Date.now();
    let t = e.changedTouches[0];
    let target = document.elementFromPoint(t.clientX, t.clientY);

    if (now - lastTapTime < doubleTapDelay && target === lastTapCell) {
      // double tap => inline edit
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        startEditingCell(target);
      }
    } else {
      // single tap => underscore toggling if blank, or just select
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        handleMobileSingleTap(target);
      }
    }
    lastTapTime = now;
    lastTapCell = target;
  }

  isTouchPanning = false;
});

function handleMobileSingleTap(cell) {
  const content = cell.textContent.trim();
  if (content === "" || content === "_") {
    // Toggle underscore
    if (content === "") {
      cell.textContent = "_";
      cellsData[getCellKey(cell)] = "_";
    } else {
      cell.textContent = "";
      delete cellsData[getCellKey(cell)];
    }
    parseAndFormatGrid();
  } else {
    // If there's text => highlight only
    clearSelection();
    selectedCells = [cell];
    cell.classList.add("selected");
    selectedCell = cell;
    inputBox.value = cell.textContent;
    updateCellLabel(cell);
  }
}

function handleLongPress(target) {
  if (!target || target.tagName !== "TD" || target.closest(".plus-row")) return;
  const key = getCellKey(target);
  const block = cellToBlockMap[key];
  const isInCurrSelection = selectedCells.includes(target);

  // If block or if we're long-pressing within an existing multi selection => drag
  if (block || (selectedCells.length > 1 && isInCurrSelection)) {
    isDraggingBlock = true;
    if (selectedCells.length > 1 && isInCurrSelection) {
      draggedBlock = null;
      draggedSelection = [...selectedCells];
    } else {
      draggedBlock = block;
      draggedSelection = null;
    }
    showDragShadow(target);
  } else {
    // Start multi-cell selection
    isTouchSelecting = true;
    touchSelectStartCell = target;
    selectCells(target, target);
  }
}

function showDragShadow(cell) {
  clearDragShadow();
  cell.classList.add("border-cell");
  dragShadowCells = [cell];
}

function clearDragShadow() {
  for (let c of dragShadowCells) {
    c.classList.remove("border-cell");
  }
  dragShadowCells = [];
}

function handleDragMove(touch) {
  clearDragShadow();
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.tagName === "TD") {
    target.classList.add("border-cell");
    dragShadowCells = [target];
  }
}

function finalizeDrag() {
  if (!dragShadowCells.length) return;
  const dropCell = dragShadowCells[0];
  let dropR = +dropCell.getAttribute("data-row");
  let dropC = +dropCell.getAttribute("data-col");
  clearDragShadow();

  if (draggedBlock) {
    // Move the entire block
    const deltaRow = dropR - draggedBlock.topRow;
    const deltaCol = dropC - draggedBlock.leftCol;
    if (canMoveBlock(draggedBlock, deltaRow, deltaCol, false)) {
      moveBlockCells(draggedBlock, deltaRow, deltaCol, false);
      parseAndFormatGrid();
    }
    draggedBlock = null;
  } else if (draggedSelection) {
    // Move the selected cells as a group
    let selRows = draggedSelection.map((td) => +td.getAttribute("data-row"));
    let selCols = draggedSelection.map((td) => +td.getAttribute("data-col"));
    let minR = Math.min(...selRows);
    let minC = Math.min(...selCols);

    let dR = dropR - minR;
    let dC = dropC - minC;

    // store old values and clear them
    let oldValues = [];
    for (let cell of draggedSelection) {
      let r = +cell.getAttribute("data-row");
      let c = +cell.getAttribute("data-col");
      oldValues.push({ row: r, col: c, text: cell.textContent });
      delete cellsData[getCellKey(cell)];
      cell.textContent = "";
    }

    // place them in new location
    for (let item of oldValues) {
      let newR = item.row + dR;
      let newC = item.col + dC;
      if (newR > numberOfRows) addRows(newR - numberOfRows);
      if (newC > numberOfColumns) addColumns(newC - numberOfColumns);

      const newTd = getCellElement(newR, newC);
      if (newTd) {
        newTd.textContent = item.text;
        cellsData[getCellKey(newTd)] = item.text;
      }
    }
    draggedSelection = null;
    parseAndFormatGrid();
  }
}

/***********************************************
 * Double-click => multiline editing in cell
 ***********************************************/
spreadsheet.addEventListener("dblclick", (e) => {
  let target = e.target;
  if (target.tagName === "TD" && !target.closest(".plus-row")) {
    startEditingCell(target);
  }
});

/***********************************************
 * Double-click editing with multiline
 * + temporarily widen column
 ***********************************************/
function startEditingCell(cell) {
  // If it's the first cell, and it starts with '^', skip it:
  const row = cell.getAttribute("data-row");
  const col = cell.getAttribute("data-col");
  if (row === "1" && col === "1") {
    let val = cellsData["R1C1"] || "";
    if (val.startsWith("^")) {
      // skip editing
      return;
    }
  }
  if (cell.querySelector("textarea")) return;

  const oldValue = cell.textContent.trim();
  cell.textContent = "";

  // Temporarily expand the column width
  const th = spreadsheet.querySelector(`th[data-col='${col}']`);
  let defaultWidth = th.style.width
    ? parseFloat(th.style.width)
    : th.offsetWidth;
  let expandedWidth = defaultWidth * 7;

  // Expand the row height
  const rowTh = spreadsheet.querySelector(`th[data-row='${row}']`);
  let defaultHeight = rowTh.style.height
    ? parseFloat(rowTh.style.height)
    : rowTh.offsetHeight;
  let expandedHeight = defaultHeight * 5;

  // Apply width expansion
  th.style.width = `${expandedWidth}px`;
  th.style.minWidth = `${expandedWidth}px`;

  const tdsInCol = spreadsheet.querySelectorAll(`td[data-col='${col}']`);
  tdsInCol.forEach((td) => {
    td.style.width = `${expandedWidth}px`;
    td.style.minWidth = `${expandedWidth}px`;
  });

  // Apply height expansion
  rowTh.style.height = `${expandedHeight}px`;
  rowTh.style.minHeight = `${expandedHeight}px`;

  const tdsInRow = spreadsheet.querySelectorAll(`td[data-row='${row}']`);
  tdsInRow.forEach((td) => {
    td.style.height = `${expandedHeight}px`;
    td.style.minHeight = `${expandedHeight}px`;
  });

  // Create the textarea
  const textarea = document.createElement("textarea");
  textarea.value = oldValue;
  textarea.style.width = "100%";
  textarea.style.height = "100%";
  textarea.style.resize = "none";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.overflowY = "auto"; // Enable vertical scrolling
  textarea.style.overflowX = "hidden";
  textarea.style.fontFamily = "inherit";
  textarea.style.fontSize = "inherit";

  cell.appendChild(textarea);
  textarea.focus();

  // Event listeners for confirming input
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (e.altKey) {
        e.preventDefault();
        insertAtCursor(textarea, "\n");
      } else {
        e.preventDefault();
        stopEditingCell(cell, textarea.value, defaultWidth, defaultHeight);
      }
    }
  });

  textarea.addEventListener("blur", () => {
    stopEditingCell(cell, textarea.value, defaultWidth, defaultHeight);
  });
}

function stopEditingCell(cell, newValue, defaultWidth, defaultHeight) {
  cell.innerHTML = ""; // Clear the cell
  cell.textContent = newValue.trim(); // Set new value

  const key = getCellKey(cell);

  if (newValue.trim() === "") {
    delete cellsData[key]; // Remove empty values
  } else {
    cellsData[key] = newValue; // Store the new value
  }

  // Restore the column width after editing
  const col = cell.getAttribute("data-col");
  const th = spreadsheet.querySelector(`th[data-col='${col}']`);
  th.style.width = `${defaultWidth}px`;
  th.style.minWidth = `${defaultWidth}px`;

  const tdsInCol = spreadsheet.querySelectorAll(`td[data-col='${col}']`);
  tdsInCol.forEach((td) => {
    td.style.width = `${defaultWidth}px`;
    td.style.minWidth = `${defaultWidth}px`;
  });

  // Restore the row height after editing
  const row = cell.getAttribute("data-row");
  const rowTh = spreadsheet.querySelector(`th[data-row='${row}']`);
  rowTh.style.height = `${defaultHeight}px`;
  rowTh.style.minHeight = `${defaultHeight}px`;

  const tdsInRow = spreadsheet.querySelectorAll(`td[data-row='${row}']`);
  tdsInRow.forEach((td) => {
    td.style.height = `${defaultHeight}px`;
    td.style.minHeight = `${defaultHeight}px`;
  });

  parseAndFormatGrid(); // Refresh formatting if needed
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  // Insert text at cursor position
  textarea.value = value.slice(0, start) + text + value.slice(end);

  // Move cursor after the inserted text
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

/***********************************************
 * Move/Select Block logic (Ctrl+Arrow, Alt+Arrow)
 * - Reworked so that:
 *   * We do NOT require single-cell selection.
 *   * If the first selected cell belongs to a block,
 *     we move that entire block's bounding box.
 ***********************************************/
function moveBlock(direction, allowMerge) {
  if (!selectedCells.length) return;

  // Check the first cell in the selection
  const firstCell = selectedCells[0];
  const cellRow = +firstCell.getAttribute("data-row");
  const cellCol = +firstCell.getAttribute("data-col");

  // Does that cell belong to a block?
  const block = cellToBlockMap[`${cellRow},${cellCol}`];
  if (!block) {
    // Not inside any block => do nothing
    return;
  }

  let dR = 0,
    dC = 0;
  switch (direction) {
    case "ArrowUp":
      dR = -1;
      break;
    case "ArrowDown":
      dR = 1;
      break;
    case "ArrowLeft":
      dC = -1;
      break;
    case "ArrowRight":
      dC = 1;
      break;
  }

  // Check if out of bounds
  if (
    block.topRow + dR < 1 ||
    block.bottomRow + dR > numberOfRows ||
    block.leftCol + dC < 1 ||
    block.rightCol + dC > numberOfColumns
  ) {
    return;
  }

  // If canMoveBlock => do it
  if (canMoveBlock(block, dR, dC, allowMerge)) {
    moveBlockCells(block, dR, dC, allowMerge);
    parseAndFormatGrid();

    // Reselect the corresponding cell at the new location
    const newCell = getCellElement(cellRow + dR, cellCol + dC);
    if (newCell) {
      clearSelection();
      newCell.classList.add("selected");
      selectedCells = [newCell];
      selectedCell = newCell;
      inputBox.value = newCell.textContent;
      updateCellLabel(newCell);

      // Scroll into view after block movement
      selectedCell.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }

    selectionAnchor = null;
  }
}

function canMoveBlock(block, dR, dC, allowMerge) {
  // Compute the new bounding box after moving.
  const newTop = block.topRow + dR;
  const newBottom = block.bottomRow + dR;
  const newLeft = block.leftCol + dC;
  const newRight = block.rightCol + dC;

  // Ensure the moved block remains within grid boundaries.
  if (
    newTop < 1 ||
    newBottom > numberOfRows ||
    newLeft < 1 ||
    newRight > numberOfColumns
  ) {
    return false;
  }

  // Expand the moved bounding box by 2 cells in every direction.
  const checkTop = Math.max(1, newTop - 2);
  const checkBottom = Math.min(numberOfRows, newBottom + 2);
  const checkLeft = Math.max(1, newLeft - 2);
  const checkRight = Math.min(numberOfColumns, newRight + 2);

  // For each other block, check if its entire grid range (bounding box) overlaps the expanded area.
  for (let otherBlock of blockList) {
    if (otherBlock === block) continue;
    if (
      // If the other block's bounding box overlaps the check area...
      otherBlock.topRow <= checkBottom &&
      otherBlock.bottomRow >= checkTop &&
      otherBlock.leftCol <= checkRight &&
      otherBlock.rightCol >= checkLeft
    ) {
      // A collision (or near collision) is found.
      return allowMerge ? true : false;
    }
  }

  // No collision found; the move is allowed.
  return true;
}

function moveBlockCells(block, dR, dC, allowMerge) {
  const newData = {};
  // Process a copy of the block's canvasCells so that if the array
  // changes (or there are collisions) we still have the full list.
  let cells = block.canvasCells.slice();

  for (let c of cells) {
    let oldKey = `R${c.row}C${c.col}`;
    let nr = c.row + dR,
      nc = c.col + dC;
    let newKey = `R${nr}C${nc}`;

    let value = cellsData[oldKey];

    // If there is already a value at newKey, then...
    if (newData[newKey] !== undefined) {
      // If the new value is nonempty and the existing value is empty, replace it.
      if (value && (!newData[newKey] || newData[newKey].trim() === "")) {
        newData[newKey] = value;
      }
      // Otherwise, leave newData[newKey] as is.
    } else {
      newData[newKey] = value;
    }

    delete cellsData[oldKey];
    // Update the cell's coordinates.
    c.row = nr;
    c.col = nc;
  }
  // Bring along any cells that were not part of the moving block.
  for (let k in cellsData) {
    if (!newData.hasOwnProperty(k)) {
      newData[k] = cellsData[k];
    }
  }
  cellsData = newData;

  // Update the block's bounding box.
  block.topRow += dR;
  block.bottomRow += dR;
  block.leftCol += dC;
  block.rightCol += dC;
}

function selectNearestBlock(direction) {
  if (!selectedCell) return;

  let row = +selectedCell.getAttribute("data-row");
  let col = +selectedCell.getAttribute("data-col");

  // If the current cell is in a block, use that. Otherwise, treat it as a 1x1 block.
  let currentBlock = cellToBlockMap[`${row},${col}`];
  let referenceBlock = currentBlock || {
    topRow: row,
    bottomRow: row,
    leftCol: col,
    rightCol: col,
  };

  // Compute the center of the reference block.
  let refCenterRow = (referenceBlock.topRow + referenceBlock.bottomRow) / 2;
  let refCenterCol = (referenceBlock.leftCol + referenceBlock.rightCol) / 2;

  // Filter candidate blocks based on the direction.
  let candidates = blockList.filter((b) => {
    if (b === currentBlock) return false; // skip self if in a block
    switch (direction) {
      case "ArrowRight":
        return b.rightCol > referenceBlock.rightCol;
      case "ArrowLeft":
        return b.leftCol < referenceBlock.leftCol;
      case "ArrowDown":
        return b.bottomRow > referenceBlock.bottomRow;
      case "ArrowUp":
        return b.topRow < referenceBlock.topRow;
      default:
        return false;
    }
  });

  if (candidates.length === 0) return;

  // Use a directional bias factor to weight the off-axis difference.
  const directionalBias = 3; // Adjust this value as needed.
  let nearest = null;
  let minDist = Infinity;

  for (let b of candidates) {
    let bCenterRow = (b.topRow + b.bottomRow) / 2;
    let bCenterCol = (b.leftCol + b.rightCol) / 2;

    // Set weights based on direction:
    let weightRow = 1,
      weightCol = 1;
    if (direction === "ArrowRight" || direction === "ArrowLeft") {
      // When moving left/right, penalize vertical (row) misalignment.
      weightRow = directionalBias;
    } else if (direction === "ArrowUp" || direction === "ArrowDown") {
      // When moving up/down, penalize horizontal (column) misalignment.
      weightCol = directionalBias;
    }

    let deltaRow = bCenterRow - refCenterRow;
    let deltaCol = bCenterCol - refCenterCol;
    let dist = Math.sqrt(
      (deltaRow * weightRow) ** 2 + (deltaCol * weightCol) ** 2
    );

    if (dist < minDist) {
      minDist = dist;
      nearest = b;
    }
  }

  if (nearest) {
    // Move selection to the center cell of the nearest block.
    let midRow = Math.floor((nearest.topRow + nearest.bottomRow) / 2);
    let midCol = Math.floor((nearest.leftCol + nearest.rightCol) / 2);
    const cell = getCellElement(midRow, midCol);
    if (cell) {
      clearSelection();
      cell.classList.add("selected");
      selectedCells = [cell];
      selectedCell = cell;
      inputBox.value = cell.textContent;
      updateCellLabel(cell);
    }
  }
}

function getBlockDistanceInDirection(a, b, dir) {
  let aT = a.topRow,
    aB = a.bottomRow,
    aL = a.leftCol,
    aR = a.rightCol;
  let bT = b.topRow,
    bB = b.bottomRow,
    bL = b.leftCol,
    bR = b.rightCol;
  let dist = null;
  switch (dir) {
    case "ArrowUp":
      if (bB < aT) dist = aT - bB - 1;
      break;
    case "ArrowDown":
      if (bT > aB) dist = bT - aB - 1;
      break;
    case "ArrowLeft":
      if (bR < aL) dist = aL - bR - 1;
      break;
    case "ArrowRight":
      if (bL > aR) dist = bL - aR - 1;
      break;
  }
  return dist;
}

function getBlockCenter(b) {
  let centerR = (b.topRow + b.bottomRow) / 2;
  let centerC = (b.leftCol + b.rightCol) / 2;
  return [centerR, centerC];
}

/************************************************
 * Keyboard Selection
 ***********************************************/

function extendSelection(dr, dc) {
  // If no anchor is set, use the current selected cell as the anchor.
  if (!selectionAnchor) {
    selectionAnchor = selectedCell;
  }
  // Get the current active cell's row and column.
  let activeRow = +selectedCell.getAttribute("data-row");
  let activeCol = +selectedCell.getAttribute("data-col");

  // Calculate the new target cell based on the arrow direction.
  let newRow = activeRow + dr;
  let newCol = activeCol + dc;

  // Keep within grid boundaries.
  if (newRow < 1) newRow = 1;
  if (newCol < 1) newCol = 1;
  if (newRow > numberOfRows) addRows(newRow - numberOfRows);
  if (newCol > numberOfColumns) addColumns(newCol - numberOfColumns);

  let newActive = getCellElement(newRow, newCol);
  if (!newActive) return;

  // Clear any previous selection and select the range from the anchor to the new active cell.
  clearSelection();
  selectCells(selectionAnchor, newActive);

  // Update the active cell.
  selectedCell = newActive;

  // (Optional) You might want to update the active cell reference as well:
  selectedCell = newActive;
}

/***********************************************
 * Helpers
 ***********************************************/
function getCellKey(cell) {
  const r = cell.getAttribute("data-row");
  const c = cell.getAttribute("data-col");
  return `R${r}C${c}`;
}

function getCellElement(r, c) {
  return spreadsheet.querySelector(`td[data-row='${r}'][data-col='${c}']`);
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Tablet|BlackBerry/i.test(
    navigator.userAgent
  );
}

/***********************************************
 * Local Storage: Save & Load Grid Data
 ***********************************************/

// Key for localStorage
const STORAGE_KEY = "savedGridData";

// Save the current grid to localStorage
function saveGridToLocalStorage() {
  const arr2D = [];

  // Determine the grid size based on existing data
  let maxRow = 1,
    maxCol = 1;
  for (let key in cellsData) {
    let match = key.match(/R(\d+)C(\d+)/);
    if (match) {
      let row = parseInt(match[1]);
      let col = parseInt(match[2]);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  }

  // Create a 2D array of empty strings
  for (let r = 0; r < maxRow; r++) {
    arr2D[r] = new Array(maxCol).fill("");
  }

  // Populate the 2D array with data from cellsData
  for (let key in cellsData) {
    let match = key.match(/R(\d+)C(\d+)/);
    if (match) {
      let row = parseInt(match[1]) - 1;
      let col = parseInt(match[2]) - 1;
      arr2D[row][col] = cellsData[key];
    }
  }

  // Convert to CSV/TSV format and store in localStorage
  const text = currentDelimiter === "tab" ? toTSV(arr2D) : toCSV(arr2D);
  localStorage.setItem(STORAGE_KEY, text);
}

// Load saved grid from localStorage
function loadGridFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;

  // Detect delimiter (TSV or CSV)
  let delim = savedData.includes("\t") ? "\t" : ",";
  let arr2D = delim === "\t" ? fromTSV(savedData) : fromCSV(savedData);

  // Ensure the grid is large enough
  let requiredRows = arr2D.length;
  let requiredCols = Math.max(...arr2D.map((row) => row.length));

  if (requiredRows > numberOfRows) {
    addRows(requiredRows - numberOfRows);
  }
  if (requiredCols > numberOfColumns) {
    addColumns(requiredCols - numberOfColumns);
  }

  // Populate the grid with saved data
  for (let r = 0; r < arr2D.length; r++) {
    for (let c = 0; c < arr2D[r].length; c++) {
      let cell = getCellElement(r + 1, c + 1);
      if (cell) {
        let val = arr2D[r][c];
        cell.textContent = val;
        cellsData[getCellKey(cell)] = val;
      }
    }
  }

  parseAndFormatGrid(); // Apply formatting
}

// Ensure every grid change is saved automatically
const originalParseAndFormatGrid = parseAndFormatGrid;
parseAndFormatGrid = function () {
  originalParseAndFormatGrid();
  saveGridToLocalStorage(); // Auto-save grid after reformatting
};

/***********************************************/
//              EVENT LISTENERS
/***********************************************/

// Listen for F3 and Escape in the global document:
document.addEventListener("keydown", (e) => {
  if (e.key === "F3") {
    e.preventDefault();
    if (selectedCells && selectedCells.length === 1) {
      let cell = selectedCells[0];
      enterNestedCell(cell);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    leaveNestedCell();
  }
});

document.addEventListener("dblclick", function (e) {
  // Ensure the target is a table cell
  if (e.target && e.target.tagName === "TD") {
    const row = e.target.getAttribute("data-row");
    const col = e.target.getAttribute("data-col");
    const cellKey = `R${row}C${col}`;
    const cellValue = cellsData[cellKey] || "";

    // If the double-clicked cell is the top-left cell (R1C1)
    if (row === "1" && col === "1") {
      if (cellValue.startsWith("^")) {
        leaveNestedCell();
        return; // Stop further execution
      }
    }

    // Check if the clicked cell contains a nested grid (starts with a comma)

    //TODO: Works but conflicts with dblClick in script.js
    // if (cellValue.startsWith(",")) {
    //   enterNestedCell(e.target);
    // }
  }
});

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("settingsIcon");
  if (icon) {
    icon.addEventListener("click", () => {
      openPopup();
    });
  }
});

document.addEventListener("mouseup", (e) => {
  if (isMidPanning && e.button === 1) {
    isMidPanning = false;
    return;
  }
  if (isSelecting && e.button === 0) {
    isSelecting = false;
  }
});

/***********************************************
 * Keyboard shortcuts (arrows, ctrl+c, ctrl+x, etc.)
 ***********************************************/
document.addEventListener("keydown", (e) => {
  if (!selectedCell) return;
  // If cell is in inline editing mode
  if (selectedCell.querySelector("textarea")) {
    return;
  }

  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // ctrl+arrow => move block
      // if e.altKey => move & merge, otherwise normal
      if (e.altKey) {
        moveBlock(e.key, true);
      } else {
        moveBlock(e.key, false);
      }
    } else if (e.altKey) {
      // NEW: alt+arrow => nearest block by geometry
      e.preventDefault();
      selectNearestBlock(e.key);
    } else if (e.shiftKey) {
      // NEW: Shift+Arrow extends the selection
      switch (e.key) {
        case "ArrowUp":
          extendSelection(-1, 0);
          break;
        case "ArrowDown":
          extendSelection(1, 0);
          break;
        case "ArrowLeft":
          extendSelection(0, -1);
          break;
        case "ArrowRight":
          extendSelection(0, 1);
          break;
      }
    } else {
      // plain arrow => move selection
      selectionAnchor = null;
      switch (e.key) {
        case "ArrowUp":
          moveSelection(-1, 0);
          break;
        case "ArrowDown":
          moveSelection(1, 0);
          break;
        case "ArrowLeft":
          moveSelection(0, -1);
          break;
        case "ArrowRight":
          moveSelection(0, 1);
          break;
      }
    }
  } else if (e.key === "Delete") {
    deleteSelectedCells();
  }
  // Ctrl+C => copy
  else if (
    (e.key === "c" || e.key === "C") &&
    e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey
  ) {
    e.preventDefault();
    handleCtrlC();
  }
  // NEW: Ctrl+X => cut
  else if (
    (e.key === "x" || e.key === "X") &&
    e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey
  ) {
    e.preventDefault();
    handleCtrlX();
  }
  // typed char => focus formula bar
  else {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      inputBox.focus();
    }
  }
});

/***********************************************
 * Resizing columns/rows
 ***********************************************/
document.addEventListener("mousemove", (e) => {
  if (isResizingCol) {
    let dx = e.pageX - startX;
    let newWidth = startWidth + dx;
    if (newWidth < 10) newWidth = 10;
    resizerCol.parentElement.style.width = newWidth + "px";

    const col = resizerCol.getAttribute("data-col");
    const tdCells = spreadsheet.querySelectorAll(`td[data-col='${col}']`);
    tdCells.forEach((cell) => {
      cell.style.width = newWidth + "px";
    });
    e.preventDefault();
  } else if (isResizingRow) {
    let dy = e.pageY - startY;
    let newHeight = startHeight + dy;
    if (newHeight < 10) newHeight = 10;
    const row = resizerRow.getAttribute("data-row");
    const rowCells = spreadsheet.querySelectorAll(
      `th[data-row='${row}'], td[data-row='${row}']`
    );
    rowCells.forEach((cell) => {
      cell.style.height = newHeight + "px";
    });
    e.preventDefault();
  }
});

document.addEventListener("mouseup", () => {
  if (isResizingCol || isResizingRow) {
    isResizingCol = false;
    isResizingRow = false;
    document.body.style.cursor = "default";
  }
});

/***********************************************
 * Copy/Paste logic
 ***********************************************/

// 1) We also capture 'copy' event to set "text/plain"
document.addEventListener("copy", (e) => {
  if (!selectedCells.length) return;
  e.preventDefault();
  e.clipboardData.setData("text/plain", copySelectedCells());
});

// 2) Paste event
/***********************************************
 * Pasting => detect CSV or TSV automatically
 ***********************************************/
// In your paste event listener:
document.addEventListener("paste", (e) => {
  if (!selectedCell) return;
  e.preventDefault();
  let text = e.clipboardData.getData("text/plain") || "";
  if (!text) return;

  // Determine delimiter (TSV or CSV)
  let delim = text.indexOf("\t") >= 0 ? "\t" : ",";
  let arr2D = delim === "\t" ? fromTSV(text) : fromCSV(text);

  let startR = +selectedCell.getAttribute("data-row");
  let startC = +selectedCell.getAttribute("data-col");

  // If only one cell was copied but multiple cells are selected, apply it to all selected cells
  if (arr2D.length === 1 && arr2D[0].length === 1 && selectedCells.length > 1) {
    let copiedValue = arr2D[0][0];

    selectedCells.forEach((cell) => {
      let key = getCellKey(cell);
      cell.textContent = copiedValue;
      cellsData[key] = copiedValue;
    });
  } else {
    // Standard paste logic for multi-cell copy-paste
    let pastedRows = arr2D.length;
    let pastedCols = Math.max(...arr2D.map((row) => row.length));
    let pasteRegion = {
      startRow: startR,
      endRow: startR + pastedRows - 1,
      startCol: startC,
      endCol: startC + pastedCols - 1,
    };

    for (let r = 0; r < arr2D.length; r++) {
      for (let c = 0; c < arr2D[r].length; c++) {
        let rr = startR + r;
        let cc = startC + c;
        if (rr > numberOfRows) addRows(rr - numberOfRows);
        if (cc > numberOfColumns) addColumns(cc - numberOfColumns);

        let cell = getCellElement(rr, cc);
        if (cell) {
          let val = arr2D[r][c];
          cell.textContent = val;
          cellsData[getCellKey(cell)] = val;
        }
      }
    }

    // If cut mode was active, remove original copied data,
    // but only for cells that were NOT pasted over.
    if (isCutMode && cutCellsData) {
      removeCutSourceData(pasteRegion);
    }
  }

  parseAndFormatGrid();

  // Set focus to the first pasted cell
  const firstPastedCell = getCellElement(startR, startC);
  if (firstPastedCell) {
    clearSelection();
    firstPastedCell.classList.add("selected");
    selectedCells = [firstPastedCell];
    selectedCell = firstPastedCell;
    inputBox.value = firstPastedCell.textContent;
    updateCellLabel(firstPastedCell);
    firstPastedCell.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }
});

/***********************************************
 * Drag & Drop CSV/TSV File Upload
 ***********************************************/
document.addEventListener("dragover", (e) => {
  e.preventDefault(); // Prevent browser from opening the file
  e.dataTransfer.dropEffect = "copy"; // Show a copy cursor
});

document.addEventListener("drop", (e) => {
  e.preventDefault(); // Stop default file open behavior

  const file = e.dataTransfer.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;

    // Detect delimiter (TSV if tabs exist, otherwise CSV)
    let delim = text.includes("\t") ? "\t" : ",";
    let arr2D = delim === "\t" ? fromTSV(text) : fromCSV(text);

    // Clear the existing grid before inserting new data
    cellsData = {}; // Reset cell data
    parseAndFormatGrid(); // Clear styling

    // Ensure the grid is large enough
    let requiredRows = arr2D.length;
    let requiredCols = Math.max(...arr2D.map((row) => row.length));

    if (requiredRows > numberOfRows) {
      addRows(requiredRows - numberOfRows);
    }
    if (requiredCols > numberOfColumns) {
      addColumns(requiredCols - numberOfColumns);
    }

    // Populate the grid with new data
    for (let r = 0; r < arr2D.length; r++) {
      for (let c = 0; c < arr2D[r].length; c++) {
        let cell = getCellElement(r + 1, c + 1);
        if (cell) {
          let val = arr2D[r][c];
          cell.textContent = val;
          cellsData[getCellKey(cell)] = val;
        }
      }
    }

    parseAndFormatGrid(); // Reapply formatting
  };

  reader.readAsText(file); // Read file as text
});

// Load grid data when the page loads
document.addEventListener("DOMContentLoaded", loadGridFromLocalStorage);

/***********************************************
 * Toggle Clear Formatting with Ctrl+Shift+~
 ***********************************************/
let isFormattingDisabled = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "~" && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    isFormattingDisabled = !isFormattingDisabled;

    if (isFormattingDisabled) {
      clearFormatting();
    } else {
      parseAndFormatGrid();
    }
  }
});

// Finally, parse/format once loaded
parseAndFormatGrid();
