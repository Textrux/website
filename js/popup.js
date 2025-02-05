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
      <p>This is an example grid application with advanced block parsing.</p>
    `;

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
            }
          });
        }

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
