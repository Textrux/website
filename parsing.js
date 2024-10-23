// Treet Parsing Algorithm
function parseAndFormatGrid() {
  // Reset data structures
  cellToBlockMap = {}; // Clear global block map
  blockList = []; // Clear global block list
  const cellPriority = {};

  // Step 1: Identify filled cells
  const filledCells = [];
  for (let key in cellsData) {
    if (cellsData[key] && cellsData[key].trim() !== "") {
      let coords = key.match(/R(\d+)C(\d+)/);
      if (coords) {
        filledCells.push({
          row: parseInt(coords[1]),
          col: parseInt(coords[2]),
          key: key,
        });
      }
    }
  }

  // Step 2: Build filled cell set for quick lookup
  const filledCellSet = new Set(
    filledCells.map((cell) => cell.row + "," + cell.col)
  );

  // Step 3: Clear previous formatting
  clearFormatting();

  // Step 4: Identify blocks
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

  // Step 5: Merge blocks recursively until no more merges occur
  let merged;
  do {
    merged = false;
    outerLoop: for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        if (areCanvasesWithinProximity(blockList[i], blockList[j], 2)) {
          mergeBlocks(blockList[i], blockList[j], cellToBlockMap, blockList);
          merged = true;
          break outerLoop; // Restart from the beginning after a merge
        }
      }
    }
  } while (merged);

  // Step 6: For each block, calculate borders, frames, and empty clusters
  for (let block of blockList) {
    const canvasCellSet = new Set(
      block.canvasCells.map((cell) => cell.row + "," + cell.col)
    );

    // Build the canvas rectangle and identify empty cluster cells
    for (let row = block.topRow; row <= block.bottomRow; row++) {
      for (let col = block.leftCol; col <= block.rightCol; col++) {
        const key = row + "," + col;
        if (!canvasCellSet.has(key)) {
          block.emptyClusterCells.push({ row, col });
          cellToBlockMap[key] = block;
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

    // Update cell priorities
    for (let cell of block.canvasCells) {
      updateCellPriority(cellPriority, cell, 3); // Priority 3 for canvas cells
    }
    for (let cell of block.emptyClusterCells) {
      updateCellPriority(cellPriority, cell, 2); // Priority 2 for empty cluster cells
    }
    for (let cell of block.borderCells) {
      updateCellPriority(cellPriority, cell, 1); // Priority 1 for border cells
    }
    for (let cell of block.frameCells) {
      updateCellPriority(cellPriority, cell, 0); // Priority 0 for frame cells
    }
  }

  // Step 7: Apply formatting based on priority
  for (let key in cellPriority) {
    const cell = cellPriority[key].cell;
    const priority = cellPriority[key].priority;
    const cellElement = getCellElement(cell.row, cell.col);
    if (cellElement) {
      switch (priority) {
        case 3:
          cellElement.classList.add("canvas-cell");
          break;
        case 2:
          cellElement.classList.add("empty-cell-cluster");
          break;
        case 1:
          cellElement.classList.add("border-cell");
          break;
        case 0:
          cellElement.classList.add("frame-cell");
          break;
      }
    }
  }

  // Step 8: Ensure filled cells always show their content and formatting
  for (let cell of filledCells) {
    let cellElement = getCellElement(cell.row, cell.col);
    if (cellElement) {
      cellElement.classList.add("canvas-cell");
      cellElement.textContent = cellsData[cell.key];
    }
  }
}

function updateCellPriority(cellPriority, cell, priority) {
  const key = cell.row + "," + cell.col;
  if (!(key in cellPriority) || cellPriority[key].priority < priority) {
    cellPriority[key] = { cell: cell, priority: priority };
  }
}

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

    // Update block boundaries
    block.topRow = Math.min(block.topRow, cell.row);
    block.bottomRow = Math.max(block.bottomRow, cell.row);
    block.leftCol = Math.min(block.leftCol, cell.col);
    block.rightCol = Math.max(block.rightCol, cell.col);

    // Explore neighboring filled cells
    const neighbors = getNeighbors(cell.row, cell.col, 1);
    for (let neighbor of neighbors) {
      const neighborKey = neighbor.row + "," + neighbor.col;
      if (filledCellSet.has(neighborKey) && !visitedCells.has(neighborKey)) {
        queue.push(neighbor);
      }
    }
  }

  return block;
}

function mergeBlocks(blockA, blockB, cellToBlockMap, blockList) {
  // Merge canvas cells
  blockA.canvasCells = blockA.canvasCells.concat(blockB.canvasCells);
  // Update cell to block mapping
  for (let cell of blockB.canvasCells) {
    const key = cell.row + "," + cell.col;
    cellToBlockMap[key] = blockA;
  }

  // Update block boundaries
  blockA.topRow = Math.min(blockA.topRow, blockB.topRow);
  blockA.bottomRow = Math.max(blockA.bottomRow, blockB.bottomRow);
  blockA.leftCol = Math.min(blockA.leftCol, blockB.leftCol);
  blockA.rightCol = Math.max(blockA.rightCol, blockB.rightCol);

  // Remove blockB from blockList
  const index = blockList.indexOf(blockB);
  if (index !== -1) {
    blockList.splice(index, 1);
  }
}

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
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 1 &&
        newRow <= numberOfRows &&
        newCol >= 1 &&
        newCol <= numberOfColumns
      ) {
        neighbors.push({ row: newRow, col: newCol });
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

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const key = row + "," + col;
      if (!cellToBlockMap[key] || cellToBlockMap[key] === currentBlock) {
        // Check if the cell is on the outline
        if (
          row === minRow ||
          row === maxRow ||
          col === minCol ||
          col === maxCol
        ) {
          outlineCells.push({ row, col });
        }
      }
    }
  }
  return outlineCells;
}

function clearFormatting() {
  const cells = spreadsheet.querySelectorAll("td");
  cells.forEach((cell) => {
    cell.classList.remove(
      "selected",
      "canvas-cell",
      "empty-cell-cluster",
      "border-cell",
      "frame-cell"
    );
    const key = getCellKey(cell);
    if (cellsData[key]) {
      cell.textContent = cellsData[key];
    } else {
      cell.textContent = "";
    }
  });
}
