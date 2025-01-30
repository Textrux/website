/***********************************************
 * parsing.js
 ***********************************************/

// Treet Parsing Algorithm
function parseAndFormatGrid() {
  // Clear global structures
  cellToBlockMap = {};
  blockList = [];

  // Collect filled cells
  const filledCells = [];
  for (let key in cellsData) {
    if (cellsData[key] && cellsData[key].trim() !== "") {
      const coords = key.match(/R(\d+)C(\d+)/);
      if (coords) {
        filledCells.push({
          row: parseInt(coords[1]),
          col: parseInt(coords[2]),
          key: key,
        });
      }
    }
  }

  const filledCellSet = new Set(filledCells.map((c) => c.row + "," + c.col));

  // Clear old classes from all cells
  clearFormatting();

  // Identify blocks
  const visitedCells = new Set();
  for (let cell of filledCells) {
    const key = cell.row + "," + cell.col;
    if (!visitedCells.has(key)) {
      const block = createBlock(
        cell,
        filledCellSet,
        visitedCells,
        cellToBlockMap
      );
      blockList.push(block);
    }
  }

  // Merge blocks until no more merges
  let merged;
  do {
    merged = false;
    outer: for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        if (areCanvasesWithinProximity(blockList[i], blockList[j], 2)) {
          mergeBlocks(blockList[i], blockList[j], cellToBlockMap, blockList);
          merged = true;
          break outer;
        }
      }
    }
  } while (merged);

  // For each block, expand to fill empty cluster cells, find borders, etc.
  const cellPriority = {};
  for (let block of blockList) {
    const canvasCellSet = new Set(
      block.canvasCells.map((c) => c.row + "," + c.col)
    );

    // Identify empty cluster cells
    for (let r = block.topRow; r <= block.bottomRow; r++) {
      for (let c = block.leftCol; c <= block.rightCol; c++) {
        const k = r + "," + c;
        if (!canvasCellSet.has(k)) {
          block.emptyClusterCells.push({ row: r, col: c });
          cellToBlockMap[k] = block;
        }
      }
    }

    // Determine border and frame cells
    block.borderCells = getOutlineCells(
      block.topRow,
      block.bottomRow,
      block.leftCol,
      block.rightCol,
      1,
      cellToBlockMap,
      block
    );
    block.frameCells = getOutlineCells(
      block.topRow,
      block.bottomRow,
      block.leftCol,
      block.rightCol,
      2,
      cellToBlockMap,
      block
    );

    // Priority: 3=canvas, 2=emptyCluster, 1=border, 0=frame
    for (let c of block.canvasCells) {
      updateCellPriority(cellPriority, c, 3);
    }
    for (let c of block.emptyClusterCells) {
      updateCellPriority(cellPriority, c, 2);
    }
    for (let c of block.borderCells) {
      updateCellPriority(cellPriority, c, 1);
    }
    for (let c of block.frameCells) {
      updateCellPriority(cellPriority, c, 0);
    }
  }

  // Apply Treet classes based on priority
  for (let k in cellPriority) {
    const cell = cellPriority[k].cell;
    const priority = cellPriority[k].priority;
    const td = getCellElement(cell.row, cell.col);
    if (!td) continue;
    switch (priority) {
      case 3:
        td.classList.add("canvas-cell");
        break;
      case 2:
        td.classList.add("empty-cell-cluster");
        break;
      case 1:
        td.classList.add("border-cell");
        break;
      case 0:
        td.classList.add("frame-cell");
        break;
    }
  }

  // Ensure filled cells show their content
  for (let cell of filledCells) {
    let cellEl = getCellElement(cell.row, cell.col);
    if (cellEl) {
      cellEl.classList.add("canvas-cell");
      cellEl.textContent = cellsData[cell.key];
    }
  }

  // Final pass for underscore vs. normal
  const allTds = document.querySelectorAll("#spreadsheet td");
  allTds.forEach((td) => {
    const content = td.textContent.trim();
    if (content === "_") {
      td.classList.remove(
        "canvas-cell",
        "empty-cell-cluster",
        "border-cell",
        "frame-cell",
        "normal-cell"
      );
      td.classList.add("underscore-cell");
    } else {
      // remove underscore if present
      td.classList.remove("underscore-cell");
      // If not in Treet classes, give normal
      if (
        !td.classList.contains("canvas-cell") &&
        !td.classList.contains("empty-cell-cluster") &&
        !td.classList.contains("border-cell") &&
        !td.classList.contains("frame-cell")
      ) {
        td.classList.add("normal-cell");
      }
    }
  });
}

// Helper: update priority
function updateCellPriority(cellPriority, cell, priority) {
  const key = cell.row + "," + cell.col;
  if (!(key in cellPriority) || cellPriority[key].priority < priority) {
    cellPriority[key] = { cell: cell, priority: priority };
  }
}

// Helper: create block
function createBlock(startCell, filledCellSet, visitedCells, cellToBlockMap) {
  const block = {
    canvasCells: [],
    emptyClusterCells: [],
    borderCells: [],
    frameCells: [],
    topRow: startCell.row,
    bottomRow: startCell.row,
    leftCol: startCell.col,
    rightCol: startCell.col,
  };

  const queue = [startCell];

  while (queue.length > 0) {
    const cell = queue.shift();
    const key = cell.row + "," + cell.col;
    if (visitedCells.has(key)) continue;
    visitedCells.add(key);
    block.canvasCells.push(cell);
    cellToBlockMap[key] = block;

    // Update boundary
    block.topRow = Math.min(block.topRow, cell.row);
    block.bottomRow = Math.max(block.bottomRow, cell.row);
    block.leftCol = Math.min(block.leftCol, cell.col);
    block.rightCol = Math.max(block.rightCol, cell.col);

    // neighbors
    const neighbors = getNeighbors(cell.row, cell.col, 1);
    for (let n of neighbors) {
      const nk = n.row + "," + n.col;
      if (filledCellSet.has(nk) && !visitedCells.has(nk)) {
        queue.push(n);
      }
    }
  }
  return block;
}

// Helper: merge blocks
function mergeBlocks(blockA, blockB, cellToBlockMap, blockList) {
  blockA.canvasCells = blockA.canvasCells.concat(blockB.canvasCells);
  for (let c of blockB.canvasCells) {
    const k = c.row + "," + c.col;
    cellToBlockMap[k] = blockA;
  }
  blockA.topRow = Math.min(blockA.topRow, blockB.topRow);
  blockA.bottomRow = Math.max(blockA.bottomRow, blockB.bottomRow);
  blockA.leftCol = Math.min(blockA.leftCol, blockB.leftCol);
  blockA.rightCol = Math.max(blockA.rightCol, blockB.rightCol);

  const idx = blockList.indexOf(blockB);
  if (idx !== -1) {
    blockList.splice(idx, 1);
  }
}

// Helper: are blocks near enough to merge?
function areCanvasesWithinProximity(blockA, blockB, proximity) {
  let verticalDistance;
  if (blockA.bottomRow < blockB.topRow) {
    verticalDistance = blockB.topRow - blockA.bottomRow - 1;
  } else if (blockB.bottomRow < blockA.topRow) {
    verticalDistance = blockA.topRow - blockB.bottomRow - 1;
  } else {
    verticalDistance = 0;
  }

  let horizontalDistance;
  if (blockA.rightCol < blockB.leftCol) {
    horizontalDistance = blockB.leftCol - blockA.rightCol - 1;
  } else if (blockB.rightCol < blockA.leftCol) {
    horizontalDistance = blockA.leftCol - blockB.rightCol - 1;
  } else {
    horizontalDistance = 0;
  }

  return verticalDistance < proximity && horizontalDistance < proximity;
}

function getNeighbors(row, col, distance) {
  const neighbors = [];
  for (let dr = -distance; dr <= distance; dr++) {
    for (let dc = -distance; dc <= distance; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 1 && nr <= numberOfRows && nc >= 1 && nc <= numberOfColumns) {
        neighbors.push({ row: nr, col: nc });
      }
    }
  }
  return neighbors;
}

function getOutlineCells(
  topRow,
  bottomRow,
  leftCol,
  rightCol,
  expandBy,
  cellToBlockMap,
  currentBlock
) {
  const outlineCells = [];
  const minRow = Math.max(1, topRow - expandBy);
  const maxRow = Math.min(numberOfRows, bottomRow + expandBy);
  const minCol = Math.max(1, leftCol - expandBy);
  const maxCol = Math.min(numberOfColumns, rightCol + expandBy);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const key = r + "," + c;
      if (!cellToBlockMap[key] || cellToBlockMap[key] === currentBlock) {
        if (r === minRow || r === maxRow || c === minCol || c === maxCol) {
          outlineCells.push({ row: r, col: c });
        }
      }
    }
  }
  return outlineCells;
}

// Clear old classes and restore text from cellsData
function clearFormatting() {
  const allCells = spreadsheet.querySelectorAll("td");
  allCells.forEach((cell) => {
    cell.classList.remove(
      "selected",
      "canvas-cell",
      "empty-cell-cluster",
      "border-cell",
      "frame-cell",
      "underscore-cell",
      "normal-cell"
    );
    const key = getCellKey(cell);
    if (cellsData[key]) {
      cell.textContent = cellsData[key];
    } else {
      cell.textContent = "";
    }
  });
}
