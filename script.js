// Variable Declarations
let NUMBER_OF_COLUMNS = 50;
let NUMBER_OF_ROWS = 50;
const ADDITIONAL_ROWS_COLUMNS = 10; // Configurable number

let numberOfColumns = NUMBER_OF_COLUMNS;
let numberOfRows = NUMBER_OF_ROWS;

let selectedCells = [];
let selectedCell = null;
let isSelecting = false;
let startCell = null;
let endCell = null;

// Global Block Data Structures
let cellToBlockMap = {}; // To map cells to their blocks
let blockList = []; // List of all blocks

// For Touch and Gestures
let isTouchPanning = false;
let touchStartX = 0;
let touchStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;
const PAN_THRESHOLD = 10; // Minimum pixels to detect panning
let longPressTimeout = null;
let longPressDuration = 500; // 0.5 second (you can adjust)
let touchStartTime = 0;
let isLongPressFired = false;

// For Selection or Drag
let isTouchSelecting = false;
let touchSelectStartCell = null;

// For "Tap" Detection
let tapMaxTime = 300; // If < 300 ms and no movement, treat as a tap

// For dragging a block or selection
let isDraggingBlock = false;
let dragOffsetRow = 0;
let dragOffsetCol = 0;
let draggedBlock = null; // If we're dragging a block
let draggedSelection = null; // If we're dragging a custom multi-cell selection
let dragShadowCells = [];

// DOM Elements
const inputBox = document.getElementById("inputBox");
const spreadsheet = document.getElementById("spreadsheet");
const cellLabel = document.getElementById("cellLabel");
const gridContainer = document.getElementById("gridContainer");
const sidePanel = document.getElementById("sidePanel");
const delimiterToggle = document.getElementById("delimiterToggle");
const toggleSidePanelButton = document.getElementById("toggleSidePanel");

const cellsData = {}; // To store cell values and states

// Generate Spreadsheet Table
function generateSpreadsheet() {
  // Clear existing content
  spreadsheet.innerHTML = "";

  // Create thead and tbody
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create header row
  const headerRow = document.createElement("tr");
  const selectAllTh = document.createElement("th");
  selectAllTh.id = "selectAllCell";
  headerRow.appendChild(selectAllTh);

  for (let col = 1; col <= numberOfColumns; col++) {
    const th = document.createElement("th");
    th.setAttribute("data-col", col);
    th.textContent = col;
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    resizer.setAttribute("data-col", col);
    th.appendChild(resizer);
    headerRow.appendChild(th);
  }

  // Add plus button to add columns
  const addColumnTh = document.createElement("th");
  addColumnTh.id = "addColumnButton";
  addColumnTh.textContent = "+";
  headerRow.appendChild(addColumnTh);

  thead.appendChild(headerRow);
  spreadsheet.appendChild(thead);

  // Create rows
  for (let row = 1; row <= numberOfRows; row++) {
    const tr = document.createElement("tr");
    // Row header
    const th = document.createElement("th");
    th.setAttribute("data-row", row);
    th.textContent = row;
    const resizerRow = document.createElement("div");
    resizerRow.classList.add("resizer-row");
    resizerRow.setAttribute("data-row", row);
    th.appendChild(resizerRow);
    tr.appendChild(th);

    for (let col = 1; col <= numberOfColumns; col++) {
      const td = document.createElement("td");
      td.setAttribute("data-row", row);
      td.setAttribute("data-col", col);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  spreadsheet.appendChild(tbody);

  // Add row for the addRowButton
  const addRowTr = document.createElement("tr");
  const addRowTh = document.createElement("th");
  addRowTh.id = "addRowButton";
  addRowTh.textContent = "+";
  addRowTr.appendChild(addRowTh);

  // Add empty td cells to match the number of columns
  for (let col = 1; col <= numberOfColumns; col++) {
    const emptyTd = document.createElement("td");
    addRowTr.appendChild(emptyTd);
  }
  tbody.appendChild(addRowTr);

  // Reattach event listeners
  attachEventListeners();
}

// Attach Event Listeners to Dynamic Elements
function attachEventListeners() {
  // Select All Cell
  const selectAllCell = document.getElementById("selectAllCell");
  selectAllCell.addEventListener("click", function () {
    // Select all cells
    let firstCell = getCellElement(1, 1);
    let lastCell = getCellElement(numberOfRows, numberOfColumns);
    if (firstCell && lastCell) {
      selectCells(firstCell, lastCell);
    }
  });

  // Add Row Button
  const addRowButton = document.getElementById("addRowButton");
  addRowButton.addEventListener("click", function () {
    addRows(ADDITIONAL_ROWS_COLUMNS);
  });

  // Add Column Button
  const addColumnButton = document.getElementById("addColumnButton");
  addColumnButton.addEventListener("click", function () {
    addColumns(ADDITIONAL_ROWS_COLUMNS);
  });

  // Resizers
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

// Initialize the spreadsheet
generateSpreadsheet();

// Event Listeners for Mouse Cell Selection
spreadsheet.addEventListener("mousedown", function (event) {
  let target = event.target;
  if (target.tagName === "TD") {
    isSelecting = true;
    startCell = target;
    selectCells(startCell, startCell);
    event.preventDefault();
  }
});

spreadsheet.addEventListener("mousemove", function (event) {
  if (isSelecting) {
    let target = event.target;
    if (target.tagName === "TD") {
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

// Toggle Side Panel Visibility
toggleSidePanelButton.addEventListener("click", function () {
  sidePanel.classList.toggle("hidden");
  if (sidePanel.classList.contains("hidden")) {
    toggleSidePanelButton.textContent = "Show Side Panel";
  } else {
    toggleSidePanelButton.textContent = "Hide Side Panel";
  }
});

// Input Handling
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
    moveSelection(1, 0); // Move to cell below
  } else if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      moveSelection(0, -1); // Move to cell to the left
    } else {
      moveSelection(0, 1); // Move to cell to the right
    }
  }
});

// Keyboard Shortcuts
document.addEventListener("keydown", function (event) {
  if (!selectedCell) return;

  // If cell has a textarea or input, do not override
  if (selectedCell.querySelector("textarea, input")) {
    return;
  }

  // Arrow keys
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      if (event.altKey) {
        // Ctrl + Alt + Arrow: Move and merge block
        moveBlock(event.key, true);
      } else {
        // Ctrl + Arrow: Move block without merging
        moveBlock(event.key, false);
      }
    } else if (event.altKey) {
      // Alt + Arrow: Select nearest block
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
    // If user types a normal character, focus input box
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

// ------------------ MOVE BLOCK FUNCTIONS (unchanged except references) ------------------
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
    // Cell not in a canvas block
    return;
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

  // Check bounds
  if (
    block.topRow + deltaRow < 1 ||
    block.bottomRow + deltaRow > numberOfRows ||
    block.leftCol + deltaCol < 1 ||
    block.rightCol + deltaCol > numberOfColumns
  ) {
    return;
  }

  // Check if block can move
  if (canMoveBlock(block, deltaRow, deltaCol, allowMerge)) {
    moveBlockCells(block, deltaRow, deltaCol, allowMerge);
    parseAndFormatGrid();

    // Reselect cell in new position
    const newCell = getCellElement(
      parseInt(cell.getAttribute("data-row")) + deltaRow,
      parseInt(cell.getAttribute("data-col")) + deltaCol
    );
    selectCell(newCell);
  }
}

function canMoveBlock(block, deltaRow, deltaCol, allowMerge) {
  const movedPositions = new Set();
  for (let cell of block.canvasCells) {
    const newRow = cell.row + deltaRow;
    const newCol = cell.col + deltaCol;
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
    for (let otherCell of otherBlock.canvasCells) {
      const key = otherCell.row + "," + otherCell.col;
      if (movedPositions.has(key)) {
        // Overlap
        if (!allowMerge) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  // If not merging, check proximity
  if (!allowMerge) {
    for (let otherBlock of blockList) {
      if (otherBlock === block) continue;
      const distance = getCanvasDistance(block, otherBlock, deltaRow, deltaCol);
      if (distance < 2) {
        return false;
      }
    }
  }

  return true;
}

function moveBlockCells(block, deltaRow, deltaCol, allowMerge) {
  const newCellsData = {};
  for (let c of block.canvasCells) {
    const oldKey = "R" + c.row + "C" + c.col;
    const newRow = c.row + deltaRow;
    const newCol = c.col + deltaCol;
    const newKey = "R" + newRow + "C" + newCol;

    newCellsData[newKey] = cellsData[oldKey];
    delete cellsData[oldKey];

    c.row = newRow;
    c.col = newCol;
  }
  // Put back everything else
  for (let key in cellsData) {
    newCellsData[key] = cellsData[key];
  }
  cellsData = newCellsData;

  // Update boundaries
  block.topRow += deltaRow;
  block.bottomRow += deltaRow;
  block.leftCol += deltaCol;
  block.rightCol += deltaCol;
}

function getCanvasDistance(blockA, blockB, deltaRow, deltaCol) {
  const movedTop = blockA.topRow + deltaRow;
  const movedBot = blockA.bottomRow + deltaRow;
  const movedLeft = blockA.leftCol + deltaCol;
  const movedRight = blockA.rightCol + deltaCol;

  const otherTop = blockB.topRow;
  const otherBot = blockB.bottomRow;
  const otherLeft = blockB.leftCol;
  const otherRight = blockB.rightCol;

  // Vertical
  let verticalDistance = 0;
  if (movedBot < otherTop) {
    verticalDistance = otherTop - movedBot - 1;
  } else if (otherBot < movedTop) {
    verticalDistance = movedTop - otherBot - 1;
  } else {
    verticalDistance = 0;
  }

  // Horizontal
  let horizontalDistance = 0;
  if (movedRight < otherLeft) {
    horizontalDistance = otherLeft - movedRight - 1;
  } else if (otherRight < movedLeft) {
    horizontalDistance = movedLeft - otherRight - 1;
  } else {
    horizontalDistance = 0;
  }

  return Math.max(verticalDistance, horizontalDistance);
}

// Select Nearest Block
function selectNearestBlock(direction) {
  if (!selectedCell) return;
  const cellKey = getCellKey(selectedCell);
  const currentBlock = cellToBlockMap[cellKey];
  if (!currentBlock) return;

  let minDistance = Infinity;
  let nearestBlock = null;

  for (let otherBlock of blockList) {
    if (otherBlock === currentBlock) continue;
    const distance = getBlockDistanceInDirection(
      currentBlock,
      otherBlock,
      direction
    );
    if (distance !== null && distance < minDistance) {
      minDistance = distance;
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

// ------------------ SELECTION HELPERS ------------------
function selectCells(cell1, cell2) {
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

  // Update selectedCell to be top-left
  if (selectedCells.length > 0) {
    if (selectedCell) {
      selectedCell.classList.remove("selected");
    }
    selectedCell = getCellElement(minRow, minCol);
    if (selectedCell) {
      selectedCell.classList.add("selected");
      inputBox.value = selectedCell.textContent;
      inputBox.focus();
      let row = selectedCell.getAttribute("data-row");
      let col = selectedCell.getAttribute("data-col");
      cellLabel.textContent = "R" + row + "C" + col;
    }
  }
}

function clearSelection() {
  selectedCells.forEach((cell) => {
    cell.classList.remove("selected");
  });
  selectedCells = [];
}

function selectCell(cell) {
  clearSelection();
  selectedCell = cell;
  selectedCell.classList.add("selected");
  selectedCells = [cell];
  inputBox.value = selectedCell.textContent;
  inputBox.focus();

  let row = selectedCell.getAttribute("data-row");
  let col = selectedCell.getAttribute("data-col");
  cellLabel.textContent = "R" + row + "C" + col;
}

// Move Selection
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

// Delete Selected Cells
function deleteSelectedCells() {
  selectedCells.forEach((cell) => {
    let key = getCellKey(cell);
    cell.textContent = "";
    delete cellsData[key];
  });
  inputBox.value = "";
  parseAndFormatGrid();
}

// ------------------ ADD ROWS/COLUMNS ------------------
function addRows(count) {
  let tbody = spreadsheet.querySelector("tbody");
  // Remove addRowButton row
  const addRowButtonRow = tbody.lastElementChild;
  tbody.removeChild(addRowButtonRow);

  for (let i = 1; i <= count; i++) {
    numberOfRows++;
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.setAttribute("data-row", numberOfRows);
    th.textContent = numberOfRows;
    let resizerRow = document.createElement("div");
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
  // Re-append addRowButton row
  tbody.appendChild(addRowButtonRow);
  attachEventListeners();
}

function addColumns(count) {
  let theadRow = spreadsheet.querySelector("thead tr");
  let tbodyRows = spreadsheet.querySelectorAll("tbody tr");

  for (let i = 1; i <= count; i++) {
    numberOfColumns++;
    // Add header cell
    let th = document.createElement("th");
    th.setAttribute("data-col", numberOfColumns);
    th.textContent = numberOfColumns;
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    resizer.setAttribute("data-col", numberOfColumns);
    th.appendChild(resizer);
    theadRow.insertBefore(th, theadRow.lastElementChild);

    // Add cells to each row
    tbodyRows.forEach((tr, index) => {
      if (index === tbodyRows.length - 1) return; // skip addRow row
      let td = document.createElement("td");
      td.setAttribute("data-row", index + 1);
      td.setAttribute("data-col", numberOfColumns);
      tr.appendChild(td);
    });
  }
  attachEventListeners();
}

// ------------------ RESIZING COLUMNS/ROWS ------------------
let isResizingCol = false;
let isResizingRow = false;
let startX, startY, startWidth, startHeight;
let resizerCol, resizerRow;

document.addEventListener("mousemove", function (event) {
  if (isResizingCol) {
    let dx = event.pageX - startX;
    let newWidth = startWidth + dx;
    if (newWidth < 30) newWidth = 30; // Minimum column width
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

// ------------------ COPY/PASTE ------------------
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
  let rows = clipboardData.split("\n");

  let startRow = parseInt(selectedCell.getAttribute("data-row"));
  let startCol = parseInt(selectedCell.getAttribute("data-col"));

  for (let i = 0; i < rows.length; i++) {
    let line = rows[i].trim();
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

// ------------------ TOUCH + LONG PRESS + DRAG LOGIC ------------------
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

  // Identify the target cell (if any) at touchstart
  let target = document.elementFromPoint(touchStartX, touchStartY);

  // Start a timer for a long-press
  longPressTimeout = setTimeout(() => {
    // If we haven't started panning yet, let's do long press stuff:
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

  // If we're dragging a block or selection, prevent scroll and handle the drag
  if (isDraggingBlock) {
    event.preventDefault();
    handleDragMove(touch);
    return;
  }

  // If we are in selection mode from long press
  if (isTouchSelecting) {
    event.preventDefault();
    let moveTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (moveTarget && moveTarget.tagName === "TD") {
      selectCells(touchSelectStartCell, moveTarget);
    }
    return;
  }

  // Otherwise, see if the user is panning
  if (!isTouchPanning) {
    // If user moves beyond threshold before long press fires, it's a pan
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

  // If dragging, finalize drop
  if (isDraggingBlock) {
    finalizeDrag();
    isDraggingBlock = false;
    return;
  }

  // If we were selecting, stop
  if (isTouchSelecting) {
    isTouchSelecting = false;
    return;
  }

  // Check if it was a tap (no pan, no long press)
  if (!isLongPressFired && !isTouchPanning) {
    let elapsed = Date.now() - touchStartTime;
    if (elapsed < tapMaxTime) {
      // It's a "tap"
      let touch = event.changedTouches[0];
      let target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.tagName === "TD") {
        handleTap(target);
      }
    }
  }
  isTouchPanning = false;
});

// Handle the logic for a long press
function handleLongPress(target) {
  if (!target || target.tagName !== "TD") return;

  // 1) If the user long-presses an empty cell (or non-empty, up to you),
  //    we do a selection start.
  // OR 2) If the user long-presses a cell in a block or in a selection,
  //    we begin a "drag" of that block/selection.

  // Check if the cell is in a block
  const cellKey = getCellKey(target);
  const block = cellToBlockMap[cellKey];

  // Check if the cell is in the current selection
  const isInCurrentSelection = selectedCells.includes(target);

  if (block || (selectedCells.length > 1 && isInCurrentSelection)) {
    // Start dragging the block or the multi selection
    isDraggingBlock = true;

    // If the user has multi selected cells, treat them as the "draggedSelection"
    if (selectedCells.length > 1 && isInCurrentSelection) {
      draggedBlock = null;
      draggedSelection = [...selectedCells];
    } else {
      // Single cell block
      draggedBlock = block;
      draggedSelection = null;
    }

    // Highlight a "shadow" if you want
    showDragShadow(target);
  } else {
    // If it's just a normal cell not in a block,
    // we start a multi-cell selection
    isTouchSelecting = true;
    touchSelectStartCell = target;
    selectCells(target, target);
  }
}

// Tapping toggles 'x' in cell (or clears it)
function handleTap(cell) {
  const key = getCellKey(cell);
  if (cell.textContent.trim() === "") {
    // Insert 'x'
    cell.textContent = "x";
    cellsData[key] = "x";
  } else {
    // Clear it
    cell.textContent = "";
    delete cellsData[key];
  }
  parseAndFormatGrid();
}

// ------------------ DRAG & DROP of BLOCK/SELECTION ------------------

// Show a simple highlight for your drag shadow
function showDragShadow(cell) {
  clearDragShadow();
  cell.classList.add("border-cell"); // Or any custom style
  dragShadowCells = [cell];
}

// As the user moves, we can highlight where the top-left corner might land
function handleDragMove(touch) {
  // For demonstration, we highlight whichever cell is under the finger
  clearDragShadow();
  let target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.tagName === "TD") {
    target.classList.add("border-cell");
    dragShadowCells = [target];
  }
}

function finalizeDrag() {
  // The cell we have in `dragShadowCells[0]` is our drop target
  if (dragShadowCells.length === 0) return;
  let dropCell = dragShadowCells[0];
  let dropRow = parseInt(dropCell.getAttribute("data-row"));
  let dropCol = parseInt(dropCell.getAttribute("data-col"));

  clearDragShadow();

  if (draggedBlock) {
    // Move entire block so that the block's "top-left" cell
    // aligns with dropCell
    let deltaRow = dropRow - draggedBlock.topRow;
    let deltaCol = dropCol - draggedBlock.leftCol;

    if (canMoveBlock(draggedBlock, deltaRow, deltaCol, false)) {
      moveBlockCells(draggedBlock, deltaRow, deltaCol, false);
      parseAndFormatGrid();
    }
    draggedBlock = null;
  } else if (draggedSelection) {
    // We have a multi-cell selection. We'll drop them so that the top-left of selection goes to dropCell
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

    // Perform a naive "cut & paste" approach
    let oldValues = [];
    draggedSelection.forEach((cell) => {
      oldValues.push({
        row: parseInt(cell.getAttribute("data-row")),
        col: parseInt(cell.getAttribute("data-col")),
        text: cell.textContent,
      });
      // Clear from old location
      let oldKey = getCellKey(cell);
      delete cellsData[oldKey];
      cell.textContent = "";
    });

    oldValues.forEach((item) => {
      let newR = item.row + deltaRow;
      let newC = item.col + deltaCol;
      // Expand grid if needed
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

function clearDragShadow() {
  dragShadowCells.forEach((cell) => {
    cell.classList.remove("border-cell");
  });
  dragShadowCells = [];
}

// ------------------ EDITING (Double Click) ------------------
spreadsheet.addEventListener("dblclick", function (event) {
  let target = event.target;
  if (target.tagName === "TD") {
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

// ------------------ HELPERS ------------------
function getCellKey(cell) {
  let row = cell.getAttribute("data-row");
  let col = cell.getAttribute("data-col");
  return "R" + row + "C" + col;
}

function getCellElement(row, col) {
  return spreadsheet.querySelector(
    'td[data-row="' + row + '"][data-col="' + col + '"]'
  );
}

// ------------------ PARSING (same as your existing parsing.js) ------------------
//function parseAndFormatGrid() {
// (same as your existing code - unchanged)
// Just ensure it re-renders classes properly after we move or edit cells
// ...
//  <your existing parsing logic from "parsing.js">
// ...
// see your original code's parseAndFormatGrid() for details
// (Make sure it references cellToBlockMap, blockList, etc. as you have it)
//}
parseAndFormatGrid();
