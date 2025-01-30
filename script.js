/***********************************************
 * script.js
 ***********************************************/
let NUMBER_OF_COLUMNS = 50;
let NUMBER_OF_ROWS = 50;
const ADDITIONAL_ROWS_COLUMNS = 10; // for the + button
const AUTO_ADD_INCREMENT = 50; // for infinite scroll near edges

let numberOfColumns = NUMBER_OF_COLUMNS;
let numberOfRows = NUMBER_OF_ROWS;

let selectedCells = [];
let selectedCell = null;
let isSelecting = false;
let startCell = null;
let endCell = null;

// Global block references (used in parsing.js)
let cellToBlockMap = {};
let blockList = [];

// Touch/pan/long press
let isTouchPanning = false;
let touchStartX = 0;
let touchStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;
const PAN_THRESHOLD = 10;
let longPressTimeout = null;
let longPressDuration = 500; // ms
let touchStartTime = 0;
let isLongPressFired = false;
let isTouchSelecting = false; // for multi-cell selection
let touchSelectStartCell = null;
let tapMaxTime = 300;

// Dragging blocks or selected ranges
let isDraggingBlock = false;
let draggedBlock = null;
let draggedSelection = null;
let dragShadowCells = [];

// For double-tap detection on mobile
let lastTapTime = 0;
let lastTapCell = null;
const doubleTapDelay = 300; // ms

// DOM Elements
const inputBox = document.getElementById("inputBox");
const spreadsheet = document.getElementById("spreadsheet");
const cellLabel = document.getElementById("cellLabel");
const gridContainer = document.getElementById("gridContainer");
const sidePanel = document.getElementById("sidePanel");
const delimiterToggle = document.getElementById("delimiterToggle");
const toggleSidePanelButton = document.getElementById("toggleSidePanel");

// Store cell data
let cellsData = {};

// =====================
// Generate Spreadsheet
// =====================
function generateSpreadsheet() {
  spreadsheet.innerHTML = "";

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Header row
  const headerRow = document.createElement("tr");
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

  // Add Column "+" button
  const addColumnTh = document.createElement("th");
  addColumnTh.id = "addColumnButton";
  addColumnTh.textContent = "+";
  headerRow.appendChild(addColumnTh);

  thead.appendChild(headerRow);
  spreadsheet.appendChild(thead);

  // Table body rows
  for (let row = 1; row <= numberOfRows; row++) {
    const tr = document.createElement("tr");

    // Row header
    const th = document.createElement("th");
    th.setAttribute("data-row", row);
    th.textContent = row;

    // Row resizer
    const resizerRow = document.createElement("div");
    resizerRow.classList.add("resizer-row");
    resizerRow.setAttribute("data-row", row);
    th.appendChild(resizerRow);

    tr.appendChild(th);

    // Data cells
    for (let col = 1; col <= numberOfColumns; col++) {
      const td = document.createElement("td");
      td.setAttribute("data-row", row);
      td.setAttribute("data-col", col);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  spreadsheet.appendChild(tbody);

  // Extra row for the "+" row button
  const addRowTr = document.createElement("tr");
  addRowTr.id = "addRowButtonRow";
  addRowTr.classList.add("plus-row"); // so it has no pointer events on TDs

  const addRowTh = document.createElement("th");
  addRowTh.id = "addRowButton";
  addRowTh.textContent = "+";
  addRowTr.appendChild(addRowTh);

  // Fill the plus row with blank TDs (pointer-events none)
  for (let col = 1; col <= numberOfColumns; col++) {
    const emptyTd = document.createElement("td");
    addRowTr.appendChild(emptyTd);
  }
  tbody.appendChild(addRowTr);

  attachEventListeners();
}

// =====================
// Attach Listeners
// =====================
function attachEventListeners() {
  // Select All Cell
  const selectAllCell = document.getElementById("selectAllCell");
  if (selectAllCell) {
    selectAllCell.addEventListener("click", function () {
      let firstCell = getCellElement(1, 1);
      let lastCell = getCellElement(numberOfRows, numberOfColumns);
      if (firstCell && lastCell) {
        selectCells(firstCell, lastCell);
      }
    });
  }

  // Add Row Button
  const addRowButton = document.getElementById("addRowButton");
  if (addRowButton) {
    addRowButton.addEventListener("click", function () {
      addRows(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  // Add Column Button
  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    addColumnButton.addEventListener("click", function () {
      addColumns(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  // Listen for mousedown on column/row resizers
  spreadsheet.addEventListener("mousedown", function (event) {
    if (event.target.classList.contains("resizer")) {
      isResizingCol = true;
      resizerCol = event.target;
      startX = event.pageX;
      let col = resizerCol.getAttribute("data-col");
      let th = spreadsheet.querySelector('th[data-col="' + col + '"]');
      startWidth = th.offsetWidth;
      document.body.style.cursor = "col-resize";
      event.preventDefault();
    } else if (event.target.classList.contains("resizer-row")) {
      isResizingRow = true;
      resizerRow = event.target;
      startY = event.pageY;
      let row = resizerRow.getAttribute("data-row");
      let th = spreadsheet.querySelector('th[data-row="' + row + '"]');
      startHeight = th.offsetHeight;
      document.body.style.cursor = "row-resize";
      event.preventDefault();
    }
  });
}

// Initialize the table
generateSpreadsheet();

/* ================
   MOUSE Selection
   ================ */
spreadsheet.addEventListener("mousedown", function (event) {
  let target = event.target;
  // Make sure it's a <td>, and NOT in the plus-row
  if (target.tagName === "TD" && !target.closest(".plus-row")) {
    isSelecting = true;
    startCell = target;
    selectCells(startCell, startCell);
    event.preventDefault();
  }
});

spreadsheet.addEventListener("mousemove", function (event) {
  if (isSelecting) {
    let target = event.target;
    if (target.tagName === "TD" && !target.closest(".plus-row")) {
      endCell = target;
      selectCells(startCell, endCell);
    }
  }
});

document.addEventListener("mouseup", function () {
  if (isSelecting) {
    isSelecting = false;
  }
});

// =======================
// Toggle Side Panel
// =======================
if (toggleSidePanelButton) {
  toggleSidePanelButton.addEventListener("click", function () {
    sidePanel.classList.toggle("hidden");
    if (sidePanel.classList.contains("hidden")) {
      toggleSidePanelButton.textContent = "Show Side Panel";
    } else {
      toggleSidePanelButton.textContent = "Hide Side Panel";
    }
  });
}

// =======================
// Formula Bar Events
// =======================
inputBox.addEventListener("input", function () {
  if (selectedCell) {
    const key = getCellKey(selectedCell);
    selectedCell.textContent = inputBox.value;
    if (inputBox.value.trim() === "") {
      delete cellsData[key];
    } else {
      cellsData[key] = inputBox.value;
    }
    parseAndFormatGrid();
  }
});

inputBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    moveSelection(1, 0);
  } else if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      moveSelection(0, -1);
    } else {
      moveSelection(0, 1);
    }
  }
});

// When formula bar is focused, auto-select all. On double-click, cursor at end.
inputBox.addEventListener("focus", (e) => {
  setTimeout(() => {
    inputBox.select();
  }, 0);
});
inputBox.addEventListener("dblclick", (e) => {
  const len = inputBox.value.length;
  inputBox.setSelectionRange(len, len);
});

// =======================
// Keyboard Shortcuts
// =======================
document.addEventListener("keydown", function (event) {
  if (!selectedCell) return;

  // If cell has a textarea or input, do not override arrow keys, etc.
  if (selectedCell.querySelector("textarea, input")) return;

  // Arrow keys
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      if (event.altKey) {
        // Ctrl + Alt + Arrow => move and merge block
        moveBlock(event.key, true);
      } else {
        // Ctrl + Arrow => move block w/o merging
        moveBlock(event.key, false);
      }
    } else if (event.altKey) {
      // Alt + Arrow => select nearest block
      selectNearestBlock(event.key);
    } else {
      // Move selection
      switch (event.key) {
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
  } else if (event.key === "Delete") {
    deleteSelectedCells();
  } else {
    // If user types a character, focus formula bar
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      inputBox.focus();
    }
  }
});

// =======================
// SELECTING CELLS
// =======================
function selectCells(cell1, cell2, focusInput = true) {
  clearSelection();

  let row1 = parseInt(cell1.getAttribute("data-row"));
  let col1 = parseInt(cell1.getAttribute("data-col"));
  let row2 = parseInt(cell2.getAttribute("data-row"));
  let col2 = parseInt(cell2.getAttribute("data-col"));

  let minRow = Math.min(row1, row2);
  let maxRow = Math.max(row1, row2);
  let minCol = Math.min(col1, col2);
  let maxCol = Math.max(col1, col2);

  selectedCells = [];

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      let cell = getCellElement(r, c);
      if (cell) {
        cell.classList.add("selected");
        selectedCells.push(cell);
      }
    }
  }

  if (selectedCells.length > 0) {
    selectedCell = getCellElement(minRow, minCol);
    if (selectedCell) {
      selectedCell.classList.add("selected");
      inputBox.value = selectedCell.textContent;
      let row = selectedCell.getAttribute("data-row");
      let col = selectedCell.getAttribute("data-col");
      cellLabel.textContent = "R" + row + "C" + col;

      if (focusInput) {
        inputBox.focus();
      }
    }
  }
}

function clearSelection() {
  selectedCells.forEach((cell) => {
    cell.classList.remove("selected");
  });
  selectedCells = [];
}

function selectCell(cell, focusInput = true) {
  clearSelection();
  selectedCell = cell;
  selectedCell.classList.add("selected");
  selectedCells = [cell];

  inputBox.value = cell.textContent;
  let row = cell.getAttribute("data-row");
  let col = cell.getAttribute("data-col");
  cellLabel.textContent = "R" + row + "C" + col;

  if (focusInput) {
    inputBox.focus();
  }
}

function moveSelection(deltaRow, deltaCol) {
  if (!selectedCell) return;
  let row = parseInt(selectedCell.getAttribute("data-row"));
  let col = parseInt(selectedCell.getAttribute("data-col"));

  let newRow = row + deltaRow;
  let newCol = col + deltaCol;
  if (newRow < 1 || newCol < 1) return;

  // Grow grid if needed
  if (newRow > numberOfRows) {
    addRows(newRow - numberOfRows);
  }
  if (newCol > numberOfColumns) {
    addColumns(newCol - numberOfColumns);
  }

  let nextCell = getCellElement(newRow, newCol);
  if (nextCell) {
    selectCell(nextCell);
  }
}

function deleteSelectedCells() {
  selectedCells.forEach((cell) => {
    let key = getCellKey(cell);
    cell.textContent = "";
    delete cellsData[key];
  });
  inputBox.value = "";
  parseAndFormatGrid();
}

// =======================
// ADD ROWS / COLUMNS
// =======================
function addRows(count) {
  let tbody = spreadsheet.querySelector("tbody");
  // Remove the addRowButton row first (the plus row)
  const plusRow = document.getElementById("addRowButtonRow");
  if (plusRow) {
    tbody.removeChild(plusRow);
  }

  for (let i = 1; i <= count; i++) {
    numberOfRows++;
    let tr = document.createElement("tr");

    let th = document.createElement("th");
    th.setAttribute("data-row", numberOfRows);
    th.textContent = numberOfRows;

    const resizerRow = document.createElement("div");
    resizerRow.classList.add("resizer-row");
    resizerRow.setAttribute("data-row", numberOfRows);
    th.appendChild(resizerRow);

    tr.appendChild(th);

    for (let col = 1; col <= numberOfColumns; col++) {
      let td = document.createElement("td");
      td.setAttribute("data-row", numberOfRows);
      td.setAttribute("data-col", col);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  // Re-append the plus row
  if (plusRow) {
    // Update the plus row so it has the new numberOfColumns cells
    while (plusRow.firstChild) {
      plusRow.removeChild(plusRow.firstChild);
    }
    // The first cell in plus row is the <th> with id=addRowButton
    const addRowTh = document.createElement("th");
    addRowTh.id = "addRowButton";
    addRowTh.textContent = "+";
    plusRow.appendChild(addRowTh);

    for (let col = 1; col <= numberOfColumns; col++) {
      const emptyTd = document.createElement("td");
      plusRow.appendChild(emptyTd);
    }
    tbody.appendChild(plusRow);
  }

  attachEventListeners();
}

function addColumns(count) {
  let theadRow = spreadsheet.querySelector("thead tr");
  let tbodyRows = spreadsheet.querySelectorAll("tbody tr");

  // Remove last TH (the + col) so we can re-insert it after new columns
  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    theadRow.removeChild(addColumnButton);
  }

  for (let i = 1; i <= count; i++) {
    numberOfColumns++;

    // new column header
    let th = document.createElement("th");
    th.setAttribute("data-col", numberOfColumns);
    th.textContent = numberOfColumns;

    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    resizer.setAttribute("data-col", numberOfColumns);
    th.appendChild(resizer);

    theadRow.appendChild(th);

    // Add cells to each data row (skip the plus row)
    tbodyRows.forEach((tr, idx) => {
      if (tr.id === "addRowButtonRow") return; // skip plus row
      let td = document.createElement("td");
      td.setAttribute("data-row", idx + 1);
      td.setAttribute("data-col", numberOfColumns);
      tr.appendChild(td);
    });
  }

  // Now re-insert the + column TH at the end
  if (addColumnButton) {
    theadRow.appendChild(addColumnButton);
  }

  // Also update the plus row so it has the correct number of columns
  const plusRow = document.getElementById("addRowButtonRow");
  if (plusRow) {
    // remove old TDs from plus row except the first TH
    while (plusRow.children.length > 1) {
      plusRow.removeChild(plusRow.lastChild);
    }
    for (let col = 1; col <= numberOfColumns; col++) {
      const emptyTd = document.createElement("td");
      plusRow.appendChild(emptyTd);
    }
  }

  attachEventListeners();
}

// ==========================
//  Column/Row Resizing
// ==========================
let isResizingCol = false;
let isResizingRow = false;
let startX, startY, startWidth, startHeight;
let resizerCol, resizerRow;

document.addEventListener("mousemove", function (event) {
  if (isResizingCol) {
    let dx = event.pageX - startX;
    let newWidth = startWidth + dx;
    if (newWidth < 30) newWidth = 30;
    resizerCol.parentElement.style.width = newWidth + "px";

    let col = resizerCol.getAttribute("data-col");
    let cells = spreadsheet.querySelectorAll('td[data-col="' + col + '"]');
    cells.forEach(function (cell) {
      cell.style.width = newWidth + "px";
    });
    event.preventDefault();
  } else if (isResizingRow) {
    let dy = event.pageY - startY;
    let newHeight = startHeight + dy;
    let row = resizerRow.getAttribute("data-row");
    let cells = spreadsheet.querySelectorAll(
      'th[data-row="' + row + '"], td[data-row="' + row + '"]'
    );
    cells.forEach(function (cell) {
      cell.style.height = newHeight + "px";
    });
    event.preventDefault();
  }
});

document.addEventListener("mouseup", function () {
  if (isResizingCol || isResizingRow) {
    isResizingCol = false;
    isResizingRow = false;
    document.body.style.cursor = "default";
  }
});

// ==========================
// COPY / PASTE
// ==========================
document.addEventListener("copy", function (event) {
  if (selectedCells.length === 0) return;
  event.preventDefault();
  let delimiter = delimiterToggle.value === "tab" ? "\t" : ",";
  let data = getSelectedCellsData(delimiter);
  event.clipboardData.setData("text/plain", data);
});

function getSelectedCellsData(delimiter) {
  let data = "";
  let rows = [];
  let minRow = Infinity,
    maxRow = -Infinity,
    minCol = Infinity,
    maxCol = -Infinity;

  selectedCells.forEach((cell) => {
    let row = parseInt(cell.getAttribute("data-row"));
    let col = parseInt(cell.getAttribute("data-col"));
    if (row < minRow) minRow = row;
    if (row > maxRow) maxRow = row;
    if (col < minCol) minCol = col;
    if (col > maxCol) maxCol = col;
  });

  for (let r = minRow; r <= maxRow; r++) {
    let rowData = [];
    for (let c = minCol; c <= maxCol; c++) {
      let cell = getCellElement(r, c);
      if (cell && selectedCells.includes(cell)) {
        rowData.push(cell.textContent);
      } else {
        rowData.push("");
      }
    }
    rows.push(rowData.join(delimiter));
  }
  data = rows.join("\n");
  return data;
}

document.addEventListener("paste", function (event) {
  if (!selectedCell) return;
  event.preventDefault();
  let clipboardData = event.clipboardData.getData("text/plain");
  let delimiter = clipboardData.includes("\t") ? "\t" : ",";
  let lines = clipboardData.split("\n");

  let startRow = parseInt(selectedCell.getAttribute("data-row"));
  let startCol = parseInt(selectedCell.getAttribute("data-col"));

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\r/g, "").trim();
    if (!line) continue;
    let cols = line.split(delimiter);
    for (let j = 0; j < cols.length; j++) {
      let row = startRow + i;
      let col = startCol + j;
      if (row > numberOfRows) {
        addRows(row - numberOfRows);
      }
      if (col > numberOfColumns) {
        addColumns(col - numberOfColumns);
      }
      let cell = getCellElement(row, col);
      if (cell) {
        cell.textContent = cols[j];
        let key = getCellKey(cell);
        cellsData[key] = cols[j];
      }
    }
  }
  parseAndFormatGrid();
});

// ==========================
// TOUCH EVENTS
// ==========================
gridContainer.addEventListener("touchstart", function (event) {
  if (event.touches.length !== 1) return;
  let touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  scrollStartX = gridContainer.scrollLeft;
  scrollStartY = gridContainer.scrollTop;
  touchStartTime = Date.now();
  isTouchPanning = false;
  isLongPressFired = false;
  isTouchSelecting = false;
  isDraggingBlock = false;

  let target = document.elementFromPoint(touchStartX, touchStartY);

  // Schedule long press
  longPressTimeout = setTimeout(() => {
    if (!isTouchPanning) {
      isLongPressFired = true;
      handleLongPress(target);
    }
  }, longPressDuration);
});

gridContainer.addEventListener("touchmove", function (event) {
  if (event.touches.length !== 1) return;
  let touch = event.touches[0];
  let dx = touch.clientX - touchStartX;
  let dy = touch.clientY - touchStartY;

  if (isDraggingBlock) {
    // We are dragging a block or selection
    event.preventDefault();
    handleDragMove(touch);
    return;
  }

  if (isTouchSelecting) {
    // We're selecting range
    event.preventDefault();
    let moveTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (
      moveTarget &&
      moveTarget.tagName === "TD" &&
      !moveTarget.closest(".plus-row")
    ) {
      selectCells(touchSelectStartCell, moveTarget, false);
    }
    return;
  }

  // Check if user is panning
  if (!isTouchPanning) {
    if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) {
      isTouchPanning = true;
      clearTimeout(longPressTimeout);
    }
  }

  if (isTouchPanning) {
    event.preventDefault();
    gridContainer.scrollLeft = scrollStartX - dx;
    gridContainer.scrollTop = scrollStartY - dy;
  }
});

gridContainer.addEventListener("touchend", function (event) {
  clearTimeout(longPressTimeout);

  // If dragging, finalize
  if (isDraggingBlock) {
    finalizeDrag();
    isDraggingBlock = false;
    return;
  }

  if (isTouchSelecting) {
    // done selecting
    isTouchSelecting = false;
    return;
  }

  // If we didn't long-press or pan => might be a tap or double tap
  if (!isLongPressFired && !isTouchPanning) {
    let now = Date.now();
    let touch = event.changedTouches[0];
    let target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (now - lastTapTime < doubleTapDelay && target === lastTapCell) {
      // Double tap => open editor
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        startEditingCell(target);
      }
    } else {
      // Single tap => toggle underscore if blank
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        handleTap(target);
      }
    }
    lastTapTime = now;
    lastTapCell = target;
  }

  isTouchPanning = false;
});

// Single tap toggles '_' if blank, or clears it if '_'
function handleTap(cell) {
  const key = getCellKey(cell);
  let txt = cell.textContent.trim();

  if (txt === "") {
    cell.textContent = "_";
    cellsData[key] = "_";
  } else if (txt === "_") {
    cell.textContent = "";
    delete cellsData[key];
  }
  // If it has other text, do nothing (or adapt as needed)

  // Select the cell but do NOT focus the input => no keyboard
  selectCell(cell, false);

  parseAndFormatGrid();
}

function handleLongPress(target) {
  if (!target || target.tagName !== "TD" || target.closest(".plus-row")) return;

  const cellKey = getCellKey(target);
  const block = cellToBlockMap[cellKey];
  const isInCurrentSelection = selectedCells.includes(target);

  if (block || (selectedCells.length > 1 && isInCurrentSelection)) {
    // Start dragging the block or the multi selection
    isDraggingBlock = true;
    if (selectedCells.length > 1 && isInCurrentSelection) {
      draggedBlock = null;
      draggedSelection = [...selectedCells];
    } else {
      draggedBlock = block; // single cell block
      draggedSelection = null;
    }
    showDragShadow(target);
  } else {
    // Start multi-cell selection
    isTouchSelecting = true;
    touchSelectStartCell = target;
    selectCells(target, target, false);
  }
}

function showDragShadow(cell) {
  clearDragShadow();
  cell.classList.add("border-cell");
  dragShadowCells = [cell];
}

function clearDragShadow() {
  dragShadowCells.forEach((cell) => {
    cell.classList.remove("border-cell");
  });
  dragShadowCells = [];
}

function handleDragMove(touch) {
  clearDragShadow();
  let target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.tagName === "TD") {
    target.classList.add("border-cell");
    dragShadowCells = [target];
  }
}

function finalizeDrag() {
  if (dragShadowCells.length === 0) return;
  let dropCell = dragShadowCells[0];
  let dropRow = parseInt(dropCell.getAttribute("data-row"));
  let dropCol = parseInt(dropCell.getAttribute("data-col"));
  clearDragShadow();

  if (draggedBlock) {
    // Move the entire block
    let deltaRow = dropRow - draggedBlock.topRow;
    let deltaCol = dropCol - draggedBlock.leftCol;

    if (canMoveBlock(draggedBlock, deltaRow, deltaCol, false)) {
      moveBlockCells(draggedBlock, deltaRow, deltaCol, false);
      parseAndFormatGrid();
    }
    draggedBlock = null;
  } else if (draggedSelection) {
    // Cut & paste approach
    let selRows = draggedSelection.map((c) =>
      parseInt(c.getAttribute("data-row"))
    );
    let selCols = draggedSelection.map((c) =>
      parseInt(c.getAttribute("data-col"))
    );
    let minRow = Math.min(...selRows);
    let minCol = Math.min(...selCols);

    let deltaRow = dropRow - minRow;
    let deltaCol = dropCol - minCol;

    let oldValues = [];
    draggedSelection.forEach((cell) => {
      oldValues.push({
        row: parseInt(cell.getAttribute("data-row")),
        col: parseInt(cell.getAttribute("data-col")),
        text: cell.textContent,
      });
      let oldKey = getCellKey(cell);
      delete cellsData[oldKey];
      cell.textContent = "";
    });

    oldValues.forEach((item) => {
      let newR = item.row + deltaRow;
      let newC = item.col + deltaCol;
      // expand grid if needed
      if (newR > numberOfRows) {
        addRows(newR - numberOfRows);
      }
      if (newC > numberOfColumns) {
        addColumns(newC - numberOfColumns);
      }
      let newCell = getCellElement(newR, newC);
      if (newCell) {
        newCell.textContent = item.text;
        let newKey = getCellKey(newCell);
        cellsData[newKey] = item.text;
      }
    });
    draggedSelection = null;
    parseAndFormatGrid();
  }
}

// ==========================
// DBLCLICK on Desktop
// ==========================
spreadsheet.addEventListener("dblclick", function (event) {
  let target = event.target;
  if (target.tagName === "TD" && !target.closest(".plus-row")) {
    startEditingCell(target);
  }
});

function startEditingCell(cell) {
  // bring up keyboard, let user edit
  if (cell.querySelector("textarea")) return; // already editing

  const textarea = document.createElement("textarea");
  textarea.value = cell.textContent;
  cell.textContent = "";
  cell.appendChild(textarea);
  textarea.focus();

  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
  textarea.addEventListener("input", function () {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      stopEditingCell(cell, textarea.value);
    }
  });
  textarea.addEventListener("blur", function () {
    stopEditingCell(cell, textarea.value);
  });
}

function stopEditingCell(cell, value) {
  cell.innerHTML = "";
  cell.textContent = value;
  const key = getCellKey(cell);
  if (value.trim() === "") {
    delete cellsData[key];
  } else {
    cellsData[key] = value;
  }
  parseAndFormatGrid();
}

// ==========================
// Infinite Scrolling
// ==========================
// not working right, commenting out for now
// gridContainer.addEventListener("scroll", function () {
//   const scrollTop = gridContainer.scrollTop;
//   const scrollHeight = gridContainer.scrollHeight;
//   const clientHeight = gridContainer.clientHeight;

//   // If near bottom, add rows
//   if (scrollTop + clientHeight >= scrollHeight - 50) {
//     addRows(AUTO_ADD_INCREMENT);
//   }
//   // If near top, remove trailing empty rows from bottom
//   if (scrollTop < 50) {
//     removeTrailingEmptyRows();
//   }

//   // Similarly for columns horizontally
//   const scrollLeft = gridContainer.scrollLeft;
//   const scrollWidth = gridContainer.scrollWidth;
//   const clientWidth = gridContainer.clientWidth;

//   if (scrollLeft + clientWidth >= scrollWidth - 50) {
//     addColumns(AUTO_ADD_INCREMENT);
//   }
//   if (scrollLeft < 50) {
//     removeTrailingEmptyColumns();
//   }
// });

function removeTrailingEmptyRows() {
  const tbody = spreadsheet.querySelector("tbody");
  // Convert NodeList to array
  const allRows = Array.from(tbody.querySelectorAll("tr"));
  if (allRows.length <= 1) return; // no data rows?

  // The last row is the plus row. So the last data row is second-to-last in the array
  let lastDataIndex = allRows.length - 2; // zero-based index
  while (lastDataIndex >= 0) {
    let tr = allRows[lastDataIndex];
    // If it has no <th data-row>, break out (maybe it's the selectAll row or something weird)
    let th = tr.querySelector("th[data-row]");
    if (!th) break;

    let rowNum = parseInt(th.getAttribute("data-row"));
    if (!rowNum) break;

    // Check emptiness
    let isEmpty = true;
    let tds = tr.querySelectorAll("td");
    for (let td of tds) {
      const key = getCellKey(td);
      if (cellsData[key]) {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) {
      // remove row
      tbody.removeChild(tr);
      numberOfRows--;
      lastDataIndex--;
    } else {
      break;
    }
  }
}

function removeTrailingEmptyColumns() {
  const theadRow = spreadsheet.querySelector("thead tr");
  const allBodyRows = spreadsheet.querySelectorAll("tbody tr");

  // We have numberOfColumns total columns. The last is the plus column.
  let lastDataCol = numberOfColumns;
  while (lastDataCol > 0) {
    // The TH for the last data col
    let lastTh = theadRow.querySelector('th[data-col="' + lastDataCol + '"]');
    if (!lastTh) break;

    // If that TH is actually the addColumnButton, break
    if (lastTh.id === "addColumnButton") {
      break;
    }

    // Check if this column is empty in all data rows
    let isEmpty = true;
    for (let row = 1; row <= numberOfRows; row++) {
      let td = getCellElement(row, lastDataCol);
      if (td) {
        const key = getCellKey(td);
        if (cellsData[key]) {
          isEmpty = false;
          break;
        }
      }
    }

    if (!isEmpty) {
      break;
    }

    // If empty, remove it from thead
    theadRow.removeChild(lastTh);

    // remove from each body row
    allBodyRows.forEach((tr) => {
      if (tr.id === "addRowButtonRow") return; // skip plus row
      let td = tr.querySelector('td[data-col="' + lastDataCol + '"]');
      if (td) {
        tr.removeChild(td);
      }
    });

    numberOfColumns--;
    lastDataCol--;
  }
}

// ==========================
//  MOVE BLOCK LOGIC
// (Unchanged except references)
// ==========================
function moveBlock(direction, allowMerge) {
  if (selectedCells.length !== 1) return;
  const cell = selectedCells[0];
  const cellKey = getCellKey(cell);
  const block = cellToBlockMap[cellKey];
  if (
    !block ||
    !block.canvasCells.find(
      (c) =>
        c.row === parseInt(cell.getAttribute("data-row")) &&
        c.col === parseInt(cell.getAttribute("data-col"))
    )
  ) {
    return; // not in a block
  }

  let deltaRow = 0;
  let deltaCol = 0;
  switch (direction) {
    case "ArrowUp":
      deltaRow = -1;
      break;
    case "ArrowDown":
      deltaRow = 1;
      break;
    case "ArrowLeft":
      deltaCol = -1;
      break;
    case "ArrowRight":
      deltaCol = 1;
      break;
  }

  // Check boundaries
  if (
    block.topRow + deltaRow < 1 ||
    block.bottomRow + deltaRow > numberOfRows ||
    block.leftCol + deltaCol < 1 ||
    block.rightCol + deltaCol > numberOfColumns
  ) {
    return;
  }

  if (canMoveBlock(block, deltaRow, deltaCol, allowMerge)) {
    moveBlockCells(block, deltaRow, deltaCol, allowMerge);
    parseAndFormatGrid();
    // reselect the same cell in its new position
    const newCell = getCellElement(
      parseInt(cell.getAttribute("data-row")) + deltaRow,
      parseInt(cell.getAttribute("data-col")) + deltaCol
    );
    if (newCell) selectCell(newCell);
  }
}

function canMoveBlock(block, deltaRow, deltaCol, allowMerge) {
  const movedPositions = new Set();
  for (let c of block.canvasCells) {
    let newRow = c.row + deltaRow;
    let newCol = c.col + deltaCol;
    if (
      newRow < 1 ||
      newRow > numberOfRows ||
      newCol < 1 ||
      newCol > numberOfColumns
    ) {
      return false;
    }
    movedPositions.add(newRow + "," + newCol);
  }

  for (let otherBlock of blockList) {
    if (otherBlock === block) continue;
    for (let oc of otherBlock.canvasCells) {
      let key = oc.row + "," + oc.col;
      if (movedPositions.has(key)) {
        if (!allowMerge) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  if (!allowMerge) {
    // Check proximity
    for (let otherBlock of blockList) {
      if (otherBlock === block) continue;
      const dist = getCanvasDistance(block, otherBlock, deltaRow, deltaCol);
      if (dist < 2) {
        return false;
      }
    }
  }
  return true;
}

function moveBlockCells(block, deltaRow, deltaCol, allowMerge) {
  const newCellsData = {};
  for (let c of block.canvasCells) {
    let oldKey = "R" + c.row + "C" + c.col;
    let newR = c.row + deltaRow;
    let newC = c.col + deltaCol;
    let newKey = "R" + newR + "C" + newC;

    newCellsData[newKey] = cellsData[oldKey];
    delete cellsData[oldKey];

    c.row = newR;
    c.col = newC;
  }
  for (let k in cellsData) {
    newCellsData[k] = cellsData[k];
  }
  cellsData = newCellsData;

  block.topRow += deltaRow;
  block.bottomRow += deltaRow;
  block.leftCol += deltaCol;
  block.rightCol += deltaCol;
}

function getCanvasDistance(blockA, blockB, dRow, dCol) {
  const movedTop = blockA.topRow + dRow;
  const movedBot = blockA.bottomRow + dRow;
  const movedLeft = blockA.leftCol + dCol;
  const movedRight = blockA.rightCol + dCol;

  const otherTop = blockB.topRow;
  const otherBot = blockB.bottomRow;
  const otherLeft = blockB.leftCol;
  const otherRight = blockB.rightCol;

  let verticalDist = 0;
  if (movedBot < otherTop) {
    verticalDist = otherTop - movedBot - 1;
  } else if (otherBot < movedTop) {
    verticalDist = movedTop - otherBot - 1;
  } else {
    verticalDist = 0;
  }

  let horizontalDist = 0;
  if (movedRight < otherLeft) {
    horizontalDist = otherLeft - movedRight - 1;
  } else if (otherRight < movedLeft) {
    horizontalDist = movedLeft - otherRight - 1;
  } else {
    horizontalDist = 0;
  }

  return Math.max(verticalDist, horizontalDist);
}

function selectNearestBlock(direction) {
  if (!selectedCell) return;
  const cellKey = getCellKey(selectedCell);
  const currentBlock = cellToBlockMap[cellKey];
  if (!currentBlock) return;

  let minDistance = Infinity;
  let nearestBlock = null;

  for (let otherBlock of blockList) {
    if (otherBlock === currentBlock) continue;
    const dist = getBlockDistanceInDirection(
      currentBlock,
      otherBlock,
      direction
    );
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      nearestBlock = otherBlock;
    }
  }

  if (nearestBlock) {
    const midRow = Math.floor(
      (nearestBlock.topRow + nearestBlock.bottomRow) / 2
    );
    const midCol = Math.floor(
      (nearestBlock.leftCol + nearestBlock.rightCol) / 2
    );
    const newCell = getCellElement(midRow, midCol);
    if (newCell) {
      selectCell(newCell);
    }
  }
}

function getBlockDistanceInDirection(currBlock, otherBlock, direction) {
  let dist = null;
  switch (direction) {
    case "ArrowUp":
      if (otherBlock.bottomRow < currBlock.topRow) {
        dist = currBlock.topRow - otherBlock.bottomRow - 1;
      }
      break;
    case "ArrowDown":
      if (otherBlock.topRow > currBlock.bottomRow) {
        dist = otherBlock.topRow - currBlock.bottomRow - 1;
      }
      break;
    case "ArrowLeft":
      if (otherBlock.rightCol < currBlock.leftCol) {
        dist = currBlock.leftCol - otherBlock.rightCol - 1;
      }
      break;
    case "ArrowRight":
      if (otherBlock.leftCol > currBlock.rightCol) {
        dist = otherBlock.leftCol - currBlock.rightCol - 1;
      }
      break;
  }
  return dist;
}

// ==========================
// Helpers
// ==========================
function getCellKey(cell) {
  const row = cell.getAttribute("data-row");
  const col = cell.getAttribute("data-col");
  return "R" + row + "C" + col;
}

function getCellElement(row, col) {
  return spreadsheet.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
}

// Initial parse/format
parseAndFormatGrid();
