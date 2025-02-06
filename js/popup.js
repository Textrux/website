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

  // Default "Copy as: CSV/TSV" setting is TSV
  // We'll keep a simple <select>, controlling global `currentDelimiter`.
  // We'll also let user choose.
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

  // Some example names (feel free to add more)
  const exampleList = ["Example Grid 1", "Example Grid 2", "Example Grid 3"];

  function renderExamples() {
    let html = "<p>Select one of the examples:</p>";
    html += `<ul style="max-height:200px; overflow:auto; list-style:none; padding-left:0;">`;
    exampleList.forEach((ex) => {
      html += `<li style="margin-bottom:6px;"><button class="exampleButton">${ex}</button></li>`;
    });
    html += "</ul>";
    return html;
  }

  const instructionsHTML = `
      <h3>Instructions</h3>
      <p>Lorem ipsum text...</p>
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
    // Build a 2D array (filled with empty strings)
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
    // Convert the 2D array to CSV/TSV (using your global functions)
    const text =
      window.currentDelimiter === "tab"
        ? window.toTSV(arr2D)
        : window.toCSV(arr2D);

    // Create a Blob and a temporary link to download the file
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = window.currentDelimiter === "tab" ? "grid.tsv" : "grid.csv";
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

        // NEW: Save Grid button
        const saveGridButton = contentDiv.querySelector("#saveGridButton");
        if (saveGridButton) {
          saveGridButton.addEventListener("click", saveGridToFile);
        }

        // NEW: Load Grid from File button and file input handler
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
        // attach click handlers
        contentDiv.querySelectorAll(".exampleButton").forEach((btn) => {
          btn.addEventListener("click", () => {
            const exampleName = btn.textContent.trim();
            loadExample(exampleName);
            closePopup();
          });
        });
        break;

      case "Instructions":
        contentDiv.innerHTML = instructionsHTML;
        break;

      case "About":
        contentDiv.innerHTML = aboutHTML;
        break;
    }
  }

  window.openPopup = function () {
    overlay.classList.remove("hidden");
    loadTab("Settings"); // default to settings
  };

  function closePopup() {
    overlay.classList.add("hidden");
  }

  closeButton.addEventListener("click", closePopup);

  // close if user clicks background
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup();
    }
  });

  // tab clicks
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      loadTab(t.dataset.tab);
    });
  });

  // load example from /Examples/ExampleGridX.csv
  async function loadExample(name) {
    // "Example Grid 1" => "ExampleGrid1.csv"
    const fileName = name.replace(/\s+/g, "") + ".csv";
    const url = `./Examples/${fileName}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        alert("Failed to load " + url);
        return;
      }
      const text = await resp.text();
      // parse as CSV
      const data = window.fromCSV(text);
      // clear grid
      window.cellsData = {};
      // populate
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
      // re-parse & format
      window.parseAndFormatGrid();
    } catch (err) {
      console.error(err);
      alert("Error loading example: " + err);
    }
  }
})();
