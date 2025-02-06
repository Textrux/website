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
    delimiter === "\t"
      ? window.fromTSV(savedGridData)
      : window.fromCSV(savedGridData);

  // Convert 2D array into cellsData format
  window.cellsData = {};
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
} else {
  window.cellsData = {}; // Default to empty grid
}

/***********************************************
 * Configuration
 ***********************************************/
let NUMBER_OF_ROWS = 125;
let NUMBER_OF_COLUMNS = 100;
let ADDITIONAL_ROWS_COLUMNS = 50;

// Our default delimiter => "tab" for TSV but first check for a local storage value
window.currentDelimiter = localStorage.getItem("savedDelimiter") || "tab";

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
window.selectedCells = [];
window.selectedCell = null;
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
const doubleTapDelay = 300;
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

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

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
 * attachEventListeners
 ***********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("settingsIcon");
  if (icon) {
    icon.addEventListener("click", () => {
      window.openPopup();
    });
  }
});

function attachEventListeners() {
  // "Select All" cell
  const selectAllCell = document.getElementById("selectAllCell");
  if (selectAllCell) {
    selectAllCell.addEventListener("click", () => {
      const firstCell = getCellElement(1, 1);
      const lastCell = getCellElement(numberOfRows, numberOfColumns);
      if (firstCell && lastCell) {
        selectCells(firstCell, lastCell);
      }
    });
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

  // Determine delimiter
  let delim = text.indexOf("\t") >= 0 ? "\t" : ",";
  let arr2D = delim === "\t" ? window.fromTSV(text) : window.fromCSV(text);

  let startR = +selectedCell.getAttribute("data-row");
  let startC = +selectedCell.getAttribute("data-col");

  // Determine paste region
  let pastedRows = arr2D.length;
  let pastedCols = Math.max(...arr2D.map((row) => row.length));
  let pasteRegion = {
    startRow: startR,
    endRow: startR + pastedRows - 1,
    startCol: startC,
    endCol: startC + pastedCols - 1,
  };

  // Paste the data into the grid.
  for (let r = 0; r < arr2D.length; r++) {
    for (let c = 0; c < arr2D[r].length; c++) {
      let rr = startR + r;
      let cc = startC + c;
      if (rr > window.numberOfRows) addRows(rr - window.numberOfRows);
      if (cc > window.numberOfColumns) addColumns(cc - window.numberOfColumns);

      let cell = getCellElement(rr, cc);
      if (cell) {
        let val = arr2D[r][c];
        cell.textContent = val;
        window.cellsData[getCellKey(cell)] = val;
      }
    }
  }

  // If cut mode was active, remove original copied data,
  // but only for cells that were NOT pasted over.
  if (isCutMode && cutCellsData) {
    removeCutSourceData(pasteRegion);
  }

  window.parseAndFormatGrid();

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

// For Ctrl+C in keydown
function handleCtrlC() {
  const text = copySelectedCells();
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
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
  if (window.currentDelimiter === "tab") {
    out = window.toTSV(arr2D);
  } else {
    out = window.toCSV(arr2D);
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
    let val = window.cellsData["R1C1"] || "";
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
    delete window.cellsData[key]; // Remove empty values
  } else {
    window.cellsData[key] = newValue; // Store the new value
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

  window.parseAndFormatGrid(); // Refresh formatting if needed
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
    let arr2D = delim === "\t" ? window.fromTSV(text) : window.fromCSV(text);

    // Clear the existing grid before inserting new data
    window.cellsData = {}; // Reset cell data
    parseAndFormatGrid(); // Clear styling

    // Ensure the grid is large enough
    let requiredRows = arr2D.length;
    let requiredCols = Math.max(...arr2D.map((row) => row.length));

    if (requiredRows > window.numberOfRows) {
      addRows(requiredRows - window.numberOfRows);
    }
    if (requiredCols > window.numberOfColumns) {
      addColumns(requiredCols - window.numberOfColumns);
    }

    // Populate the grid with new data
    for (let r = 0; r < arr2D.length; r++) {
      for (let c = 0; c < arr2D[r].length; c++) {
        let cell = getCellElement(r + 1, c + 1);
        if (cell) {
          let val = arr2D[r][c];
          cell.textContent = val;
          window.cellsData[getCellKey(cell)] = val;
        }
      }
    }

    parseAndFormatGrid(); // Reapply formatting
  };

  reader.readAsText(file); // Read file as text
});

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
  const text =
    window.currentDelimiter === "tab"
      ? window.toTSV(arr2D)
      : window.toCSV(arr2D);
  localStorage.setItem(STORAGE_KEY, text);
}

// Load saved grid from localStorage
function loadGridFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;

  // Detect delimiter (TSV or CSV)
  let delim = savedData.includes("\t") ? "\t" : ",";
  let arr2D =
    delim === "\t" ? window.fromTSV(savedData) : window.fromCSV(savedData);

  // Ensure the grid is large enough
  let requiredRows = arr2D.length;
  let requiredCols = Math.max(...arr2D.map((row) => row.length));

  if (requiredRows > window.numberOfRows) {
    addRows(requiredRows - window.numberOfRows);
  }
  if (requiredCols > window.numberOfColumns) {
    addColumns(requiredCols - window.numberOfColumns);
  }

  // Populate the grid with saved data
  for (let r = 0; r < arr2D.length; r++) {
    for (let c = 0; c < arr2D[r].length; c++) {
      let cell = getCellElement(r + 1, c + 1);
      if (cell) {
        let val = arr2D[r][c];
        cell.textContent = val;
        window.cellsData[getCellKey(cell)] = val;
      }
    }
  }

  parseAndFormatGrid(); // Apply formatting
}

// Ensure every grid change is saved automatically
const originalParseAndFormatGrid = window.parseAndFormatGrid;
window.parseAndFormatGrid = function () {
  originalParseAndFormatGrid();
  saveGridToLocalStorage(); // Auto-save grid after reformatting
};

// Load grid data when the page loads
document.addEventListener("DOMContentLoaded", loadGridFromLocalStorage);

// Finally, parse/format once loaded
parseAndFormatGrid();
