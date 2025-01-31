/***********************************************
 * script.js - Final updated version
 ***********************************************/

/***********************************************
 * Global data structure so parsing.js can see it
 ***********************************************/
window.cellsData = {}; 

////////////////////////////////////////////
// Configuration
////////////////////////////////////////////
let NUMBER_OF_ROWS = 125; 
let NUMBER_OF_COLUMNS = 100; 
let ADDITIONAL_ROWS_COLUMNS = 50; 

////////////////////////////////////////////
// For Treet parser
////////////////////////////////////////////
let cellToBlockMap = {};
let blockList = [];

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
let longPressDuration = 500;
let isLongPressFired = false;
let isTouchSelecting = false;
let touchSelectStartCell = null;
const tapMaxTime = 300;
let lastTapTime = 0;
let lastTapCell = null;
const doubleTapDelay = 300;
let isDraggingBlock = false;
let draggedBlock = null;
let draggedSelection = null;
let dragShadowCells = [];

// For resizing
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
const toggleSidePanelButton = document.getElementById("toggleSidePanel");

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

  // + columns
  const addColumnTh = document.createElement("th");
  addColumnTh.id = "addColumnButton";
  addColumnTh.textContent = "+";
  headerRow.appendChild(addColumnTh);

  thead.appendChild(headerRow);
  spreadsheet.appendChild(thead);

  // Body
  for (let row = 1; row <= numberOfRows; row++) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.setAttribute("data-row", row);
    th.textContent = row;

    const rowResizer = document.createElement("div");
    rowResizer.classList.add("resizer-row");
    rowResizer.setAttribute("data-row", row);
    th.appendChild(rowResizer);

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
 * Attach Event Listeners
 ***********************************************/
function attachEventListeners() {
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

  const addRowButton = document.getElementById("addRowButton");
  if (addRowButton) {
    addRowButton.addEventListener("click", () => {
      addRows(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  const addColumnButton = document.getElementById("addColumnButton");
  if (addColumnButton) {
    addColumnButton.addEventListener("click", () => {
      addColumns(ADDITIONAL_ROWS_COLUMNS);
    });
  }

  // Resizing logic
  spreadsheet.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resizer")) {
      isResizingCol = true;
      resizerCol = e.target;
      startX = e.pageX;
      const col = resizerCol.getAttribute("data-col");
      const th = spreadsheet.querySelector(`th[data-col='${col}']`);
      startWidth = th.offsetWidth;
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    } else if (e.target.classList.contains("resizer-row")) {
      isResizingRow = true;
      resizerRow = e.target;
      startY = e.pageY;
      const row = resizerRow.getAttribute("data-row");
      const theadTh = spreadsheet.querySelector(`th[data-row='${row}']`);
      startHeight = theadTh.offsetHeight;
      document.body.style.cursor = "row-resize";
      e.preventDefault();
    }
  });
}

/***********************************************
 * Mouse Interactions
 ***********************************************/
spreadsheet.addEventListener("mousedown", (e) => {
  if (e.button === 1) {
    // Middle-click => pan
    isMidPanning = true;
    midPanStartX = e.clientX;
    midPanStartY = e.clientY;
    midPanScrollLeft = gridContainer.scrollLeft;
    midPanScrollTop = gridContainer.scrollTop;
    e.preventDefault();
    return;
  }

  if (e.button === 0) {
    // left-click => selection
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
  if (isMidPanning) {
    const dx = e.clientX - midPanStartX;
    const dy = e.clientY - midPanStartY;
    gridContainer.scrollLeft = midPanScrollLeft - dx;
    gridContainer.scrollTop = midPanScrollTop - dy;
    e.preventDefault();
    return;
  }

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
 * Toggle side panel
 ***********************************************/
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

/***********************************************
 * Formula Bar Events
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

inputBox.addEventListener("keydown", (e) => {
  // SHIFT+Enter => up one row, Enter => down one row
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    moveSelection(1, 0);
  } else if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    moveSelection(-1, 0);
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      moveSelection(0, -1);
    } else {
      moveSelection(0, 1);
    }
  }
});

inputBox.addEventListener("focus", () => {
  setTimeout(() => {
    inputBox.select();
  }, 0);
});

inputBox.addEventListener("dblclick", () => {
  const len = inputBox.value.length;
  inputBox.setSelectionRange(len, len);
});

/***********************************************
 * Keyboard Shortcuts
 ***********************************************/
document.addEventListener("keydown", (e) => {
  if (!selectedCell) return;
  // If cell has an inline editor (textarea)
  if (selectedCell.querySelector("textarea")) {
    return;
  }

  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Move blocks
      if (e.altKey) {
        // Ctrl+Alt+Arrow => move & merge
        moveBlock(e.key, true);
      } else {
        // Ctrl+Arrow => move block w/o merge
        moveBlock(e.key, false);
      }
    } else if (e.altKey) {
      // Alt+Arrow => select nearest block
      selectNearestBlock(e.key);
    } else {
      // Normal arrow => move selection
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
  else if ((e.key === "c" || e.key === "C") && e.ctrlKey && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    handleCtrlC();
  }
  // (Optional) Ctrl+X => cut, if you want...
  // else if ((e.key === "x" || e.key === "X") && e.ctrlKey && !e.altKey && !e.shiftKey) {
  //   e.preventDefault();
  //   handleCtrlX();
  // }
  else {
    // typed char => focus formula bar (unless Ctrl or Alt or Meta)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      inputBox.focus();
    }
  }
});

/***********************************************
 * Copy/Paste
 ***********************************************/
// We rely on the "copy" event for fallback if needed
document.addEventListener("copy", (e) => {
  if (!selectedCells.length) return;
  e.preventDefault();
  const text = getSelectedCellsAsDelimited();
  e.clipboardData.setData("text/plain", text);
});

// On paste, auto-detect tab vs comma
document.addEventListener("paste", (e) => {
  if (!selectedCell) return;
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  if (!text) return;

  // Auto-detect delimiter if any tabs found => split by \t else by ,
  let delim = text.indexOf("\t") >= 0 ? "\t" : ",";
  const lines = text.replace(/\r/g, "").split("\n");

  // Start cell
  const startR = +selectedCell.getAttribute("data-row");
  const startC = +selectedCell.getAttribute("data-col");

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    let cols = lines[i].split(delim);
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
  parseAndFormatGrid();
});

/***********************************************
 * handleCtrlC => manual copy approach 
 * (some browsers block doc.execCommand).
 ***********************************************/
function handleCtrlC() {
  if (!selectedCells.length) return;
  const text = getSelectedCellsAsDelimited();
  // Try async API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.warn("Clipboard write failed", err);
    });
  } else {
    // fallback => hidden textarea
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
 * getSelectedCellsAsDelimited
 *   => check delimiterToggle for CSV or TSV
 ***********************************************/
function getSelectedCellsAsDelimited() {
  // find bounding rect
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (let cell of selectedCells) {
    let r = +cell.getAttribute("data-row");
    let c = +cell.getAttribute("data-col");
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }
  const delimiter = (delimiterToggle.value === "tab") ? "\t" : ",";

  let lines = [];
  for (let row = minR; row <= maxR; row++) {
    let rowCells = [];
    for (let col = minC; col <= maxC; col++) {
      let td = getCellElement(row, col);
      if (td && selectedCells.includes(td)) {
        rowCells.push(td.textContent || "");
      } else {
        rowCells.push("");
      }
    }
    lines.push(rowCells.join(delimiter));
  }
  return lines.join("\n");
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
    let topLeftCell = getCellElement(minR, minC);
    if (topLeftCell) {
      selectedCell = topLeftCell;
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
    selectCells(nextCell, nextCell);
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
 * Double-click => multiline editing directly in cell
 ***********************************************/
spreadsheet.addEventListener("dblclick", (e) => {
  let target = e.target;
  if (target.tagName === "TD" && !target.closest(".plus-row")) {
    startEditingCell(target);
  }
});

function startEditingCell(cell) {
  if (cell.querySelector("textarea")) return; // already editing

  const oldValue = cell.textContent;
  cell.textContent = "";

  const textarea = document.createElement("textarea");
  // Let it auto-size in both directions
  textarea.style.resize = "both";
  textarea.style.overflow = "auto";
  textarea.style.minWidth = "30px";
  textarea.style.minHeight = "30px";

  textarea.value = oldValue;
  cell.appendChild(textarea);

  textarea.focus();
  textarea.addEventListener("keydown", (e) => {
    // finalize on Enter if not Shift
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
 * Move/Select Block logic
 ***********************************************/
function moveBlock(direction, allowMerge) {
  // Must have exactly one selected cell
  if (selectedCells.length !== 1) return;
  const cell = selectedCells[0];
  const key = getCellKey(cell);
  const block = cellToBlockMap[key];
  if (!block) return;

  let cellRow = +cell.getAttribute("data-row");
  let cellCol = +cell.getAttribute("data-col");

  // Check if this cell is actually part of block.canvasCells
  if (!block.canvasCells.find((p) => p.row === cellRow && p.col === cellCol)) {
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
  // Check bounds
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
    // reselect new position
    let newCell = getCellElement(cellRow + dR, cellCol + dC);
    if (newCell) selectCells(newCell, newCell);
  }
}

function canMoveBlock(block, dR, dC, allowMerge) {
  const moved = new Set();
  for (let c of block.canvasCells) {
    let nr = c.row + dR,
      nc = c.col + dC;
    if (nr < 1 || nr > numberOfRows || nc < 1 || nc > numberOfColumns)
      return false;
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
  // keep the rest
  for (let k in cellsData) {
    newData[k] = cellsData[k];
  }
  cellsData = newData;

  block.topRow += dR;
  block.bottomRow += dR;
  block.leftCol += dC;
  block.rightCol += dC;
}

function selectNearestBlock(direction) {
  if (!selectedCell) return;
  const key = getCellKey(selectedCell);
  const currentBlock = cellToBlockMap[key];
  if (!currentBlock) return;

  let minDist = Infinity;
  let nearest = null;
  for (let b of blockList) {
    if (b === currentBlock) continue;
    let dist = getBlockDistanceInDirection(currentBlock, b, direction);
    if (dist !== null && dist < minDist) {
      minDist = dist;
      nearest = b;
    }
  }
  if (nearest) {
    let midRow = Math.floor((nearest.topRow + nearest.bottomRow) / 2);
    let midCol = Math.floor((nearest.leftCol + nearest.rightCol) / 2);
    let cell = getCellElement(midRow, midCol);
    if (cell) selectCells(cell, cell);
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

// Re-parse once loaded
parseAndFormatGrid();
