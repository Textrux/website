/***********************************************
 * script.js - Merged version with mobile logic + new fixes
 ***********************************************/

/***********************************************
 * Global data structure so parsing.js can see it
 ***********************************************/
window.cellsData = {};

/***********************************************
 * Configuration
 ***********************************************/
let NUMBER_OF_ROWS = 125;
let NUMBER_OF_COLUMNS = 100;
let ADDITIONAL_ROWS_COLUMNS = 50;

/***********************************************
 * For Treet parser references
 ***********************************************/
let cellToBlockMap = {};
let blockList = [];

// Keep track of total row/col counts
let numberOfRows = NUMBER_OF_ROWS;
let numberOfColumns = NUMBER_OF_COLUMNS;

// Selected cells
let selectedCells = [];
let selectedCell = null;
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
const delimiterToggle = document.getElementById("delimiterToggle");
// (If you had a "toggleSidePanelButton" in index.html uncommented, we’d reference it. Otherwise it's commented out.)
// const toggleSidePanelButton = document.getElementById("toggleSidePanel");

// NEW: For implementing cut/paste logic
let isCutMode = false;
let cutCellsData = null;

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
    } else {
      // plain arrow => move selection
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

  // Also copy text to clipboard (same as handleCtrlC)
  const text = getSelectedCellsData(
    delimiterToggle.value === "tab" ? "\t" : ","
  );
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch((err) => console.warn(err));
  } else {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
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
    selectedCells.push(nextCell);
    selectedCell = nextCell;
    inputBox.value = nextCell.textContent;
    updateCellLabel(nextCell);
    if (!isMobileDevice()) {
      inputBox.focus();
    }
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
  const delimiter = delimiterToggle.value === "tab" ? "\t" : ",";
  e.clipboardData.setData("text/plain", getSelectedCellsData(delimiter));
});

// 2) Paste event
document.addEventListener("paste", (e) => {
  if (!selectedCell) return;
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain") || "";
  if (!text) return;

  // auto detect tab vs comma if there's a \t
  const delim = text.indexOf("\t") >= 0 ? "\t" : ",";

  // CHANGED: Do NOT skip empty lines. Just split on newlines
  const lines = text.replace(/\r/g, "").split("\n");

  // Check if this is a single cell's data
  // (i.e. lines.length===1 and exactly 1 column)
  if (lines.length === 1) {
    const rowStr = lines[0]; // no trim
    const cols = rowStr.split(delim);
    if (cols.length === 1) {
      // Single cell in clipboard
      // If user has multiple selected cells, fill them all with this single value
      if (selectedCells.length > 1) {
        for (let cell of selectedCells) {
          cell.textContent = cols[0];
          cellsData[getCellKey(cell)] = cols[0];
        }
        // If it was a cut, remove original now
        if (isCutMode && cutCellsData) {
          removeCutSourceData();
        }
        parseAndFormatGrid();
        return;
      }
    }
  }

  // Otherwise do multiline (or multi-column) paste, anchored at selectedCell
  const startR = +selectedCell.getAttribute("data-row");
  const startC = +selectedCell.getAttribute("data-col");

  for (let i = 0; i < lines.length; i++) {
    // no trim => if lines[i] is blank, we still parse it
    const rowStr = lines[i];
    const cols = rowStr.split(delim);

    for (let j = 0; j < cols.length; j++) {
      let rr = startR + i;
      let cc = startC + j;
      if (rr > numberOfRows) addRows(rr - numberOfRows);
      if (cc > numberOfColumns) addColumns(cc - numberOfColumns);

      const cell = getCellElement(rr, cc);
      if (cell) {
        cell.textContent = cols[j];
        cellsData[getCellKey(cell)] = cols[j];
      }
    }
  }

  // If it was a cut, remove the original
  if (isCutMode && cutCellsData) {
    removeCutSourceData();
  }

  parseAndFormatGrid();
});

// For Ctrl+C in keydown
function handleCtrlC() {
  if (!selectedCells.length) return;
  const text = getSelectedCellsData(
    delimiterToggle.value === "tab" ? "\t" : ","
  );
  if (navigator.clipboard && window.isSecureContext) {
    // async
    navigator.clipboard.writeText(text).catch((err) => console.warn(err));
  } else {
    // fallback
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
}

/***********************************************
 * Helper for removing original data on cut
 ***********************************************/
function removeCutSourceData() {
  for (let item of cutCellsData) {
    delete cellsData[`R${item.row}C${item.col}`];
    const oldCell = getCellElement(item.row, item.col);
    if (oldCell) oldCell.textContent = "";
  }
  isCutMode = false;
  cutCellsData = null;
}

/***********************************************
 * getSelectedCellsData
 ***********************************************/
function getSelectedCellsData(delimiter) {
  if (!selectedCells.length) return "";
  let minR = Infinity,
    maxR = -Infinity,
    minC = Infinity,
    maxC = -Infinity;

  selectedCells.forEach((cell) => {
    const r = +cell.getAttribute("data-row");
    const c = +cell.getAttribute("data-col");
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  });

  let lines = [];
  for (let r = minR; r <= maxR; r++) {
    let rowData = [];
    for (let c = minC; c <= maxC; c++) {
      const cell = getCellElement(r, c);
      if (cell && selectedCells.includes(cell)) {
        rowData.push(cell.textContent || "");
      } else {
        rowData.push("");
      }
    }
    lines.push(rowData.join(delimiter));
  }
  return lines.join("\n");
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

function startEditingCell(cell) {
  // if there's already a textarea, do nothing
  if (cell.querySelector("textarea")) return;

  const oldValue = cell.textContent;
  cell.textContent = "";

  const textarea = document.createElement("textarea");
  textarea.style.resize = "both";
  textarea.style.overflow = "auto";
  textarea.style.minWidth = "30px";
  textarea.style.minHeight = "30px";

  textarea.value = oldValue;
  cell.appendChild(textarea);

  textarea.focus();

  // finalize on Enter (unless Shift)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      stopEditingCell(cell, textarea.value);
    }
  });
  textarea.addEventListener("blur", () => {
    stopEditingCell(cell, textarea.value);
  });
}

function stopEditingCell(cell, newValue) {
  cell.innerHTML = "";
  cell.textContent = newValue;
  const key = getCellKey(cell);
  if (newValue.trim() === "") {
    delete cellsData[key];
  } else {
    cellsData[key] = newValue;
  }
  parseAndFormatGrid();
}

/***********************************************
 * Move/Select Block logic (Ctrl+Arrow, Alt+Arrow)
 ***********************************************/
function moveBlock(direction, allowMerge) {
  // Must have exactly one cell selected
  if (selectedCells.length !== 1) return;

  const cell = selectedCells[0];
  const key = getCellKey(cell);
  const block = cellToBlockMap[key];
  if (!block) return;

  let cellRow = +cell.getAttribute("data-row");
  let cellCol = +cell.getAttribute("data-col");

  // check if cell is actually in the block
  const inBlock = block.canvasCells.some(
    (p) => p.row === cellRow && p.col === cellCol
  );
  if (!inBlock) return;

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

  if (
    block.topRow + dR < 1 ||
    block.bottomRow + dR > numberOfRows ||
    block.leftCol + dC < 1 ||
    block.rightCol + dC > numberOfColumns
  ) {
    return;
  }

  if (canMoveBlock(block, dR, dC, allowMerge)) {
    moveBlockCells(block, dR, dC, allowMerge);
    parseAndFormatGrid();
    // reselect new location
    const newCell = getCellElement(cellRow + dR, cellCol + dC);
    if (newCell) {
      clearSelection();
      newCell.classList.add("selected");
      selectedCells = [newCell];
      selectedCell = newCell;
    }
  }
}

function canMoveBlock(block, dR, dC, allowMerge) {
  const moved = new Set();
  for (let c of block.canvasCells) {
    let nr = c.row + dR;
    let nc = c.col + dC;
    if (nr < 1 || nr > numberOfRows || nc < 1 || nc > numberOfColumns) {
      return false;
    }
    moved.add(`${nr},${nc}`);
  }
  // check collisions
  for (let otherBlock of blockList) {
    if (otherBlock === block) continue;
    for (let p of otherBlock.canvasCells) {
      let k = `${p.row},${p.col}`;
      if (moved.has(k)) {
        if (!allowMerge) return false;
        else return true;
      }
    }
  }
  return true;
}

function moveBlockCells(block, dR, dC, allowMerge) {
  const newData = {};
  for (let c of block.canvasCells) {
    let oldKey = `R${c.row}C${c.col}`;
    let nr = c.row + dR,
      nc = c.col + dC;
    let newKey = `R${nr}C${nc}`;
    newData[newKey] = cellsData[oldKey];
    delete cellsData[oldKey];
    c.row = nr;
    c.col = nc;
  }
  for (let k in cellsData) {
    if (!newData[k]) {
      newData[k] = cellsData[k];
    }
  }
  cellsData = newData;

  block.topRow += dR;
  block.bottomRow += dR;
  block.leftCol += dC;
  block.rightCol += dC;
}

/***********************************************
 * Alt+Arrow => nearest block by geometry
 ***********************************************/
function selectNearestBlock(direction) {
  if (!selectedCell) return;
  const currentBlock = cellToBlockMap[getCellKey(selectedCell)];
  if (!currentBlock) return;

  const [curR, curC] = getBlockCenter(currentBlock);

  // Filter blocks strictly in the direction
  let candidates = blockList.filter((b) => b !== currentBlock);
  switch (direction) {
    case "ArrowUp":
      candidates = candidates.filter(
        ([bR, bC] = getBlockCenter(b)) => bR < curR
      );
      break;
    case "ArrowDown":
      candidates = candidates.filter(
        ([bR, bC] = getBlockCenter(b)) => bR > curR
      );
      break;
    case "ArrowLeft":
      candidates = candidates.filter(
        ([bR, bC] = getBlockCenter(b)) => bC < curC
      );
      break;
    case "ArrowRight":
      candidates = candidates.filter(
        ([bR, bC] = getBlockCenter(b)) => bC > curC
      );
      break;
  }
  if (!candidates.length) return;

  let nearestDist = Infinity;
  let nearestBlock = null;
  for (let b of candidates) {
    const [bR, bC] = getBlockCenter(b);
    const dist = Math.sqrt((bR - curR) ** 2 + (bC - curC) ** 2);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestBlock = b;
    }
  }

  if (nearestBlock) {
    const midRow = Math.floor(
      (nearestBlock.topRow + nearestBlock.bottomRow) / 2
    );
    const midCol = Math.floor(
      (nearestBlock.leftCol + nearestBlock.rightCol) / 2
    );
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

function getBlockCenter(b) {
  let centerR = (b.topRow + b.bottomRow) / 2;
  let centerC = (b.leftCol + b.rightCol) / 2;
  return [centerR, centerC];
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

// Finally, parse/format once loaded
parseAndFormatGrid();
