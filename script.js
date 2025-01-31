/***********************************************
 * script.js
 ***********************************************/
/*
  CHANGES:
  - Default to 150 rows x 100 columns
  - Each + adds 100 more rows/cols
  - On mobile single tap logic changed:
     * If cell empty/_ => toggle underscore, no keyboard, no selection
     * If cell has other text => bring up keyboard
  - Double-click / double-tap on #selectAllCell => scroll top-left
  - Retain Ctrl+Alt arrow key logic (note OS conflicts).
*/
let NUMBER_OF_ROWS = 150;
let NUMBER_OF_COLUMNS = 100;
const ADDITIONAL_ROWS_COLUMNS = 100; // "plus" now adds 100

let numberOfRows = NUMBER_OF_ROWS;
let numberOfColumns = NUMBER_OF_COLUMNS;

let selectedCells = [];
let selectedCell = null;
let isSelecting = false;
let startCell = null;
let endCell = null;

// Global block references (used in parsing.js)
let cellToBlockMap = {};
let blockList = [];

// For multi-touch, panning, long press
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
let isTouchSelecting = false;
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
  selectAllTh.textContent = "★"; // visually distinct?
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

  // Fill the plus row with blank TDs
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
  // Single-click on selectAllCell => select all
  // Double-click => scroll top-left
  const selectAllCell = document.getElementById("selectAllCell");
  if (selectAllCell) {
    selectAllCell.addEventListener("click", onSelectAllClicked);
    selectAllCell.addEventListener("dblclick", onSelectAllDblClicked);
    // On mobile, we can also do a touchstart/touchend double-tap detection if needed
    // but let's keep it simple. iOS Safari might interpret double-tap differently.
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

function onSelectAllClicked() {
  // Single-click => select everything
  const firstCell = getCellElement(1, 1);
  const lastCell = getCellElement(numberOfRows, numberOfColumns);
  if (firstCell && lastCell) {
    selectCells(firstCell, lastCell);
  }
}

function onSelectAllDblClicked(e) {
  // Double-click => scroll to top-left
  e.preventDefault();
  gridContainer.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

// Initialize the table
generateSpreadsheet();

/* ================
   MOUSE Selection
   ================ */
spreadsheet.addEventListener("mousedown", function (event) {
  let target = event.target;
  // Skip if it's in the plus-row
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

// Auto-select all text on focus. Dblclick => cursor at end
inputBox.addEventListener("focus", () => {
  setTimeout(() => {
    inputBox.select();
  }, 0);
});
inputBox.addEventListener("dblclick", () => {
  const len = inputBox.value.length;
  inputBox.setSelectionRange(len, len);
});

// =======================
// Keyboard Shortcuts
// =======================
document.addEventListener("keydown", function (event) {
  // If no selectedCell or we're currently editing a textarea, skip
  if (!selectedCell) return;
  if (selectedCell.querySelector("textarea, input")) return;

  // Arrow keys
  if (event.key.startsWith("Arrow")) {
    // Some OS/browsers might override Ctrl+Alt+Arrow, so it may not fire
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      if (event.altKey) {
        // Ctrl+Alt+Arrow => move+merge block
        moveBlock(event.key, true);
      } else {
        // Ctrl+Arrow => move block w/o merging
        moveBlock(event.key, false);
      }
    } else if (event.altKey) {
      // Alt+Arrow => select nearest block
      selectNearestBlock(event.key);
    } else {
      // Just arrow => move selection
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
    // If user types a normal char, focus formula bar
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
      updateCellLabel(row, col);

      if (focusInput) {
        inputBox.focus();
      }
    }
  }
}

function updateCellLabel(r, c) {
  cellLabel.textContent = `R${r}C${c}`;
  cellLabel.setAttribute("title", `R${r}C${c}`);
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
  updateCellLabel(row, col);

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
  // Remove the plus row first
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

  // Re-append plus row
  if (plusRow) {
    while (plusRow.firstChild) {
      plusRow.removeChild(plusRow.firstChild);
    }
    const addRowTh = document.createElement("th");
    addRowTh.id = "addRowButton";
    addRowTh.textContent = "+";
    plusRow.appendChild(addRowTh);

    for (let col = 1; col <= numberOfColumns; col++) {
      let emptyTd = document.createElement("td");
      plusRow.appendChild(emptyTd);
    }
    tbody.appendChild(plusRow);
  }

  attachEventListeners();
}

function addColumns(count) {
  let theadRow = spreadsheet.querySelector("thead tr");
  let tbodyRows = spreadsheet.querySelectorAll("tbody tr");

  // Remove the + col first
  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    theadRow.removeChild(addColumnButton);
  }

  for (let i = 1; i <= count; i++) {
    numberOfColumns++;

    let th = document.createElement("th");
    th.setAttribute("data-col", numberOfColumns);
    th.textContent = numberOfColumns;

    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    resizer.setAttribute("data-col", numberOfColumns);
    th.appendChild(resizer);

    theadRow.appendChild(th);

    // For each data row (skip plus row)
    tbodyRows.forEach((tr, idx) => {
      if (tr.id === "addRowButtonRow") return;
      let td = document.createElement("td");
      td.setAttribute("data-row", idx + 1);
      td.setAttribute("data-col", numberOfColumns);
      tr.appendChild(td);
    });
  }

  // Re-append the + col
  if (addColumnButton) {
    theadRow.appendChild(addColumnButton);
  }

  // Update plus row
  const plusRow = document.getElementById("addRowButtonRow");
  if (plusRow) {
    while (plusRow.children.length > 1) {
      plusRow.removeChild(plusRow.lastChild);
    }
    for (let col = 1; col <= numberOfColumns; col++) {
      let emptyTd = document.createElement("td");
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
    if (newHeight < 30) newHeight = 30;
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
// TOUCH EVENTS (Mobile)
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
    // dragging a block or selection
    event.preventDefault();
    handleDragMove(touch);
    return;
  }

  if (isTouchSelecting) {
    // multi-cell selection
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

  // Possibly panning
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

  // finalize drag
  if (isDraggingBlock) {
    finalizeDrag();
    isDraggingBlock = false;
    return;
  }

  if (isTouchSelecting) {
    isTouchSelecting = false;
    return;
  }

  // single tap or double tap
  if (!isLongPressFired && !isTouchPanning) {
    let now = Date.now();
    let touch = event.changedTouches[0];
    let target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (now - lastTapTime < doubleTapDelay && target === lastTapCell) {
      // Double tap => open editor for that cell
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        startEditingCell(target);
      }
    } else {
      // Single tap =>
      if (target && target.tagName === "TD" && !target.closest(".plus-row")) {
        handleMobileSingleTap(target);
      }
    }
    lastTapTime = now;
    lastTapCell = target;
  }

  isTouchPanning = false;
});

/* On mobile single tap:
   - If cell is empty or underscore => toggle underscore, no keyboard
   - If cell has other text => bring up keyboard and let user edit.
*/
function handleMobileSingleTap(cell) {
  const existing = cell.textContent.trim();
  if (existing === "" || existing === "_") {
    // Toggle underscore
    if (existing === "") {
      cell.textContent = "_";
      cellsData[getCellKey(cell)] = "_";
    } else if (existing === "_") {
      cell.textContent = "";
      delete cellsData[getCellKey(cell)];
    }
    // No selection highlight or keyboard focus
    parseAndFormatGrid();
  } else {
    // There's other text => bring up keyboard
    selectCell(cell, true);
  }
}

// Long-press => range selection or block drag
function handleLongPress(target) {
  if (!target || target.tagName !== "TD" || target.closest(".plus-row")) return;

  const cellKey = getCellKey(target);
  const block = cellToBlockMap[cellKey];
  const isInCurrentSelection = selectedCells.includes(target);

  if (block || (selectedCells.length > 1 && isInCurrentSelection)) {
    // Start dragging
    isDraggingBlock = true;
    if (selectedCells.length > 1 && isInCurrentSelection) {
      draggedBlock = null;
      draggedSelection = [...selectedCells];
    } else {
      draggedBlock = block;
      draggedSelection = null;
    }
    showDragShadow(target);
  } else {
    // multi-cell selection
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
    // Move entire block
    let deltaRow = dropRow - draggedBlock.topRow;
    let deltaCol = dropCol - draggedBlock.leftCol;
    if (canMoveBlock(draggedBlock, deltaRow, deltaCol, false)) {
      moveBlockCells(draggedBlock, deltaRow, deltaCol, false);
      parseAndFormatGrid();
    }
    draggedBlock = null;
  } else if (draggedSelection) {
    // "cut & paste" approach
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
// DBLCLICK on Desktop Cells
// ==========================
spreadsheet.addEventListener("dblclick", function (event) {
  let target = event.target;
  if (target.tagName === "TD" && !target.closest(".plus-row")) {
    startEditingCell(target);
  }
});

function startEditingCell(cell) {
  if (cell.querySelector("textarea")) return;
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

// Helpers
function getCellKey(cell) {
  const row = cell.getAttribute("data-row");
  const col = cell.getAttribute("data-col");
  return "R" + row + "C" + col;
}

function getCellElement(row, col) {
  return spreadsheet.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
}

// parseAndFormatGrid() is from parsing.js
parseAndFormatGrid();
