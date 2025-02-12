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
    for (let key in window.cellsData) {
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
    for (let key in window.cellsData) {
      let match = key.match(/R(\d+)C(\d+)/);
      if (match) {
        const row = parseInt(match[1]) - 1;
        const col = parseInt(match[2]) - 1;
        arr2D[row][col] = window.cellsData[key];
      }
    }

    // Convert the 2D array to CSV or TSV using your global functions
    const text =
      window.currentDelimiter === "tab"
        ? window.toTSV(arr2D)
        : window.toCSV(arr2D);

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
    fileName += window.currentDelimiter === "tab" ? ".tsv" : ".csv";

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
          window.currentDelimiter = sel.value; // Ensure it's set globally

          sel.addEventListener("change", () => {
            window.currentDelimiter = sel.value;
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
              window.cellsData = {}; // Reset all cell data
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
            const dataArray =
              delim === "\t" ? window.fromTSV(text) : window.fromCSV(text);

            // Clear current grid data
            window.cellsData = {};

            // Optionally, adjust the grid size if needed:
            const requiredRows = dataArray.length;
            const requiredCols = Math.max(
              ...dataArray.map((row) => row.length)
            );
            if (requiredRows > window.numberOfRows) {
              addRows(requiredRows - window.numberOfRows);
            }
            if (requiredCols > window.numberOfColumns) {
              addColumns(requiredCols - window.numberOfColumns);
            }

            // Populate cellsData from the file’s contents
            for (let r = 0; r < dataArray.length; r++) {
              for (let c = 0; c < dataArray[r].length; c++) {
                const val = dataArray[r][c];
                if (val.trim()) {
                  const rowIndex = r + 1;
                  const colIndex = c + 1;
                  const key = `R${rowIndex}C${colIndex}`;
                  window.cellsData[key] = val;
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
  window.openPopup = function () {
    overlay.classList.remove("hidden");
    loadTab("Settings"); // default to settings
  };

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
    const url = `./Examples/${fileName}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        alert("Failed to load " + url);
        return;
      }
      const text = await resp.text();
      // Parse as CSV
      const data = window.fromCSV(text);
      // Clear grid
      window.cellsData = {};
      // Populate the grid
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c];
          if (val.trim()) {
            const rowIndex = r + 1;
            const colIndex = c + 1;
            const key = `R${rowIndex}C${colIndex}`;
            window.cellsData[key] = val;
          }
        }
      }
      // Re-parse & format the grid
      window.parseAndFormatGrid();
    } catch (err) {
      console.error(err);
      alert("Error loading example: " + err);
    }
  }
})();
