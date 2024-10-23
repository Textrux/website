// Variable Declarations
let NUMBER_OF_COLUMNS = 15;
let NUMBER_OF_ROWS = 30;
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
  // Create a th for the addRowButton
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

// Event Listeners for Cell Selection and Interaction
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

document.addEventListener("mouseup", function (event) {
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
    moveSelection(0, 1); // Move to cell to the right
  }
});

// Keydown event handling
document.addEventListener("keydown", function (event) {
  if (!selectedCell) return;

  // Check if we are in edit mode
  if (selectedCell.querySelector("textarea, input")) {
    // In edit mode, do nothing
    return;
  }

  // Handle key presses
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
      // Alt + Arrow: Select nearest block in that direction
      selectNearestBlock(event.key);
    } else {
      // Normal arrow key navigation
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
    // Focus on inputBox when typing
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

// Move Block Functionality
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
    // Cell is not part of any block canvas
    return;
  }

  // Determine deltaRow and deltaCol based on direction
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

  // Check if moving the block would go out of bounds
  if (
    block.topRow + deltaRow < 1 ||
    block.bottomRow + deltaRow > numberOfRows ||
    block.leftCol + deltaCol < 1 ||
    block.rightCol + deltaCol > numberOfColumns
  ) {
    return;
  }

  // Check if block can be moved
  const canMove = canMoveBlock(block, deltaRow, deltaCol, allowMerge);
  if (canMove) {
    moveBlockCells(block, deltaRow, deltaCol, allowMerge);
    parseAndFormatGrid(); // Re-parse and format the grid
    // Reselect the cell in the new position
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
      return false; // Out of bounds
    }
    movedPositions.add(newRow + "," + newCol);
  }

  for (let otherBlock of blockList) {
    if (otherBlock === block) continue;
    for (let otherCell of otherBlock.canvasCells) {
      const key = otherCell.row + "," + otherCell.col;
      if (movedPositions.has(key)) {
        // There's an overlap
        if (!allowMerge) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  // Check proximity
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
  // Create a new cellsData object
  const newCellsData = {};
  // Remove old cells from cellsData and add new ones
  for (let cell of block.canvasCells) {
    const oldKey = "R" + cell.row + "C" + cell.col;
    const newRow = cell.row + deltaRow;
    const newCol = cell.col + deltaCol;
    const newKey = "R" + newRow + "C" + newCol;

    // Update cellsData
    newCellsData[newKey] = cellsData[oldKey];
    delete cellsData[oldKey];

    // Update cell coordinates
    cell.row = newRow;
    cell.col = newCol;
  }

  // Add back other cells to newCellsData
  for (let key in cellsData) {
    newCellsData[key] = cellsData[key];
  }

  cellsData = newCellsData;

  // Update block boundaries
  block.topRow += deltaRow;
  block.bottomRow += deltaRow;
  block.leftCol += deltaCol;
  block.rightCol += deltaCol;
}

function getCanvasDistance(blockA, blockB, deltaRow, deltaCol) {
  // Get the boundaries of blockA after moving
  const movedTopRow = blockA.topRow + deltaRow;
  const movedBottomRow = blockA.bottomRow + deltaRow;
  const movedLeftCol = blockA.leftCol + deltaCol;
  const movedRightCol = blockA.rightCol + deltaCol;

  // Get the boundaries of blockB
  const otherTopRow = blockB.topRow;
  const otherBottomRow = blockB.bottomRow;
  const otherLeftCol = blockB.leftCol;
  const otherRightCol = blockB.rightCol;

  // Compute vertical distance
  let verticalDistance = 0;
  if (movedBottomRow < otherTopRow) {
    verticalDistance = otherTopRow - movedBottomRow - 1;
  } else if (otherBottomRow < movedTopRow) {
    verticalDistance = movedTopRow - otherBottomRow - 1;
  } else {
    verticalDistance = 0;
  }

  // Compute horizontal distance
  let horizontalDistance = 0;
  if (movedRightCol < otherLeftCol) {
    horizontalDistance = otherLeftCol - movedRightCol - 1;
  } else if (otherRightCol < movedLeftCol) {
    horizontalDistance = movedLeftCol - otherRightCol - 1;
  } else {
    horizontalDistance = 0;
  }

  // Return the maximum of vertical and horizontal distances
  return Math.max(verticalDistance, horizontalDistance);
}

// Select Nearest Block Functionality
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
    // Select the middle cell of the nearest block
    const middleRow = Math.floor(
      (nearestBlock.topRow + nearestBlock.bottomRow) / 2
    );
    const middleCol = Math.floor(
      (nearestBlock.leftCol + nearestBlock.rightCol) / 2
    );
    const newCell = getCellElement(middleRow, middleCol);
    if (newCell) {
      selectCell(newCell);
    }
  }
}

function getBlockDistanceInDirection(currentBlock, otherBlock, direction) {
  let distance = null;

  switch (direction) {
    case "ArrowUp":
      if (otherBlock.bottomRow < currentBlock.topRow) {
        distance = currentBlock.topRow - otherBlock.bottomRow - 1;
      }
      break;
    case "ArrowDown":
      if (otherBlock.topRow > currentBlock.bottomRow) {
        distance = otherBlock.topRow - currentBlock.bottomRow - 1;
      }
      break;
    case "ArrowLeft":
      if (otherBlock.rightCol < currentBlock.leftCol) {
        distance = currentBlock.leftCol - otherBlock.rightCol - 1;
      }
      break;
    case "ArrowRight":
      if (otherBlock.leftCol > currentBlock.rightCol) {
        distance = otherBlock.leftCol - currentBlock.rightCol - 1;
      }
      break;
  }

  return distance;
}

// Cell Selection Functions
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

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      let cell = getCellElement(row, col);
      if (cell) {
        cell.classList.add("selected");
        selectedCells.push(cell);
      }
    }
  }

  // Update selectedCell to be the top-left cell
  if (selectedCells.length > 0) {
    if (selectedCell) {
      selectedCell.classList.remove("selected");
    }
    selectedCell = getCellElement(minRow, minCol);
    selectedCell.classList.add("selected");
    inputBox.value = selectedCell.textContent;
    inputBox.focus();
    let row = selectedCell.getAttribute("data-row");
    let col = selectedCell.getAttribute("data-col");
    cellLabel.textContent = "R" + row + "C" + col;
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

  if (newRow < 1 || newCol < 1) {
    return; // Out of bounds
  }

  // Grow grid if necessary
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

// Add Rows and Columns
function addRows(count) {
  let tbody = spreadsheet.querySelector("tbody");
  // Remove the addRowButton row temporarily
  const addRowButtonRow = tbody.lastElementChild;
  tbody.removeChild(addRowButtonRow);

  for (let i = 1; i <= count; i++) {
    numberOfRows++;
    let tr = document.createElement("tr");
    // Row header
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

  // Reattach the addRowButton row
  tbody.appendChild(addRowButtonRow);

  // Reattach event listeners
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
      // Skip the last row if it's the addRowButton row
      if (index === tbodyRows.length - 1) return;
      let td = document.createElement("td");
      td.setAttribute("data-row", index + 1);
      td.setAttribute("data-col", numberOfColumns);
      tr.appendChild(td);
    });
  }

  // Reattach event listeners
  attachEventListeners();
}

// Resizing Columns and Rows
let isResizingCol = false;
let isResizingRow = false;
let startX, startY, startWidth, startHeight;
let resizerCol, resizerRow;

document.addEventListener("mousemove", function (event) {
  if (isResizingCol) {
    let dx = event.pageX - startX;
    let newWidth = startWidth + dx;
    if (newWidth < 30) newWidth = 30; // Minimum column width
    resizerCol.parentElement.style.width = newWidth + "px"; // Adjust the th width
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

document.addEventListener("mouseup", function (event) {
  if (isResizingCol || isResizingRow) {
    isResizingCol = false;
    isResizingRow = false;
    document.body.style.cursor = "default";
    event.preventDefault();
  }
});

// Helper Functions
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

// Copy Functionality
document.addEventListener("copy", function (event) {
  if (selectedCells.length === 0) return;

  event.preventDefault();
  let delimiter = delimiterToggle.value;
  if (delimiter === "tab") {
    delimiter = "\t";
  }
  let data = getSelectedCellsData(delimiter);
  event.clipboardData.setData("text/plain", data);
});

function getSelectedCellsData(delimiter) {
  let data = "";
  let rows = [];
  let minRow = Infinity,
    maxRow = -Infinity;
  let minCol = Infinity,
    maxCol = -Infinity;

  selectedCells.forEach((cell) => {
    let row = parseInt(cell.getAttribute("data-row"));
    let col = parseInt(cell.getAttribute("data-col"));
    minRow = Math.min(minRow, row);
    maxRow = Math.max(minRow, row);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(minCol, col);
  });

  for (let row = minRow; row <= maxRow; row++) {
    let rowData = [];
    for (let col = minCol; col <= maxCol; col++) {
      let cell = getCellElement(row, col);
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

// Paste Functionality
document.addEventListener("paste", function (event) {
  if (!selectedCell) return;
  event.preventDefault();

  let clipboardData = event.clipboardData.getData("text/plain");
  let delimiter = clipboardData.includes("\t") ? "\t" : ",";
  let rows = clipboardData.split("\n");

  let startRow = parseInt(selectedCell.getAttribute("data-row"));
  let startCol = parseInt(selectedCell.getAttribute("data-col"));

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].trim() === "") continue;
    let cols = rows[i].split(delimiter);
    for (let j = 0; j < cols.length; j++) {
      let row = startRow + i;
      let col = startCol + j;

      // Grow grid if necessary
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

// Double-Click to Edit Cell
spreadsheet.addEventListener("dblclick", function (event) {
  let target = event.target;
  if (target.tagName === "TD") {
    startEditingCell(target);
  }
});

function startEditingCell(cell) {
  // Prevent editing if already editing
  if (cell.querySelector("textarea")) return;

  // Create a textarea
  const textarea = document.createElement("textarea");
  textarea.value = cell.textContent;
  cell.textContent = ""; // Clear cell content
  cell.appendChild(textarea);
  textarea.focus();

  // Adjust textarea height automatically
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
  textarea.addEventListener("input", function () {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  // Handle Shift+Enter for new lines
  textarea.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      // Save content and exit edit mode
      event.preventDefault();
      stopEditingCell(cell, textarea.value);
    }
  });

  // Handle blur event to save content when focus is lost
  textarea.addEventListener("blur", function () {
    stopEditingCell(cell, textarea.value);
  });
}

function stopEditingCell(cell, value) {
  cell.innerHTML = ""; // Clear cell content
  cell.textContent = value; // Set new value
  const key = getCellKey(cell);
  if (value.trim() === "") {
    delete cellsData[key];
  } else {
    cellsData[key] = value;
  }
  parseAndFormatGrid();
}

// Initialize parsing and formatting
parseAndFormatGrid();
