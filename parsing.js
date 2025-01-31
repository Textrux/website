/***********************************************
 * parsing.js
 ***********************************************/

// We expect "cellsData", "cellToBlockMap", and "blockList" to already exist globally.

function parseAndFormatGrid() {
  // Clear references
  cellToBlockMap = {};
  blockList = [];

  // Gather filled cells from cellsData
  const filledCells = [];
  for (let k in cellsData) {
    const val = cellsData[k];
    if (val && val.trim() !== "") {
      const m = k.match(/R(\d+)C(\d+)/);
      if (m) {
        filledCells.push({
          row: +m[1],
          col: +m[2],
          key: k,
        });
      }
    }
  }
  const filledSet = new Set(filledCells.map((f) => `${f.row},${f.col}`));

  // Clear old CSS classes from the table
  clearFormatting();

  // Build blocks
  const visited = new Set();
  for (let fc of filledCells) {
    const fcKey = `${fc.row},${fc.col}`;
    if (!visited.has(fcKey)) {
      const block = createBlock(fc, filledSet, visited, cellToBlockMap);
      blockList.push(block);
    }
  }

  // Merge blocks if near
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

  // For each block, expand empty cluster, find border/frame
  const cellPriority = {};
  for (let b of blockList) {
    const canvasSet = new Set(
      b.canvasCells.map((c) => `${c.row},${c.col}`)
    );

    for (let r = b.topRow; r <= b.bottomRow; r++) {
      for (let c = b.leftCol; c <= b.rightCol; c++) {
        const key = `${r},${c}`;
        if (!canvasSet.has(key)) {
          b.emptyClusterCells.push({ row: r, col: c });
          cellToBlockMap[key] = b;
        }
      }
    }

    b.borderCells = getOutlineCells(b.topRow, b.bottomRow, b.leftCol, b.rightCol, 1, cellToBlockMap, b);
    b.frameCells = getOutlineCells(b.topRow, b.bottomRow, b.leftCol, b.rightCol, 2, cellToBlockMap, b);

    // Priority: 3 = canvas, 2= empty cluster, 1= border, 0= frame
    for (let cc of b.canvasCells) {
      updateCellPriority(cellPriority, cc, 3);
    }
    for (let cc of b.emptyClusterCells) {
      updateCellPriority(cellPriority, cc, 2);
    }
    for (let cc of b.borderCells) {
      updateCellPriority(cellPriority, cc, 1);
    }
    for (let cc of b.frameCells) {
      updateCellPriority(cellPriority, cc, 0);
    }
  }

  // Apply classes based on priority
  for (let k in cellPriority) {
    const obj = cellPriority[k];
    const td = getCellElement(obj.cell.row, obj.cell.col);
    if (!td) continue;
    switch (obj.priority) {
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

  // Ensure actual text in those cells
  for (let fc of filledCells) {
    const td = getCellElement(fc.row, fc.col);
    if (td) {
      td.classList.add("canvas-cell");
      td.textContent = cellsData[fc.key];
    }
  }

  // Final pass for underscore
  const allTds = document.querySelectorAll("#spreadsheet td");
  allTds.forEach((td) => {
    let txt = td.textContent.trim();
    if (txt === "_") {
      td.classList.remove(
        "canvas-cell",
        "empty-cell-cluster",
        "border-cell",
        "frame-cell",
        "normal-cell"
      );
      td.classList.add("underscore-cell");
    } else {
      td.classList.remove("underscore-cell");
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

/***********************************************
 * Treet Block Helpers
 ***********************************************/
function updateCellPriority(cellPriority, cell, priority) {
  let key = `${cell.row},${cell.col}`;
  if (!cellPriority[key] || cellPriority[key].priority < priority) {
    cellPriority[key] = { cell, priority };
  }
}

function createBlock(startCell, filledSet, visited, mapRef) {
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
  while (queue.length) {
    const cell = queue.shift();
    const key = `${cell.row},${cell.col}`;
    if (visited.has(key)) continue;
    visited.add(key);
    block.canvasCells.push(cell);
    mapRef[key] = block;

    block.topRow = Math.min(block.topRow, cell.row);
    block.bottomRow = Math.max(block.bottomRow, cell.row);
    block.leftCol = Math.min(block.leftCol, cell.col);
    block.rightCol = Math.max(block.rightCol, cell.col);

    // neighbors
    const neighbors = getNeighbors(cell.row, cell.col, 1);
    for (let n of neighbors) {
      const nk = `${n.row},${n.col}`;
      if (filledSet.has(nk) && !visited.has(nk)) {
        queue.push(n);
      }
    }
  }
  return block;
}

function mergeBlocks(a, b, mapRef, blockList) {
  a.canvasCells = a.canvasCells.concat(b.canvasCells);
  for (let cc of b.canvasCells) {
    mapRef[`${cc.row},${cc.col}`] = a;
  }
  a.topRow = Math.min(a.topRow, b.topRow);
  a.bottomRow = Math.max(a.bottomRow, b.bottomRow);
  a.leftCol = Math.min(a.leftCol, b.leftCol);
  a.rightCol = Math.max(a.rightCol, b.rightCol);

  let idx = blockList.indexOf(b);
  if (idx !== -1) blockList.splice(idx, 1);
}

function areCanvasesWithinProximity(a, b, proximity) {
  let vertDist = 0;
  if (a.bottomRow < b.topRow) {
    vertDist = b.topRow - a.bottomRow - 1;
  } else if (b.bottomRow < a.topRow) {
    vertDist = a.topRow - b.bottomRow - 1;
  } else {
    vertDist = 0;
  }

  let horizDist = 0;
  if (a.rightCol < b.leftCol) {
    horizDist = b.leftCol - a.rightCol - 1;
  } else if (b.rightCol < a.leftCol) {
    horizDist = a.leftCol - b.rightCol - 1;
  } else {
    horizDist = 0;
  }

  return vertDist < proximity && horizDist < proximity;
}

function getNeighbors(r, c, dist) {
  let out = [];
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr;
      let nc = c + dc;
      if (nr >= 1 && nc >= 1) {
        out.push({ row: nr, col: nc });
      }
    }
  }
  return out;
}

function getOutlineCells(top, bottom, left, right, expandBy, mapRef, block) {
  let out = [];
  let minR = Math.max(1, top - expandBy);
  let maxR = bottom + expandBy;
  let minC = Math.max(1, left - expandBy);
  let maxC = right + expandBy;

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      let key = `${r},${c}`;
      if (!mapRef[key] || mapRef[key] === block) {
        if (r === minR || r === maxR || c === minC || c === maxC) {
          out.push({ row: r, col: c });
        }
      }
    }
  }
  return out;
}

function clearFormatting() {
  const allCells = document.querySelectorAll("#spreadsheet td");
  allCells.forEach((td) => {
    td.classList.remove(
      "selected",
      "canvas-cell",
      "empty-cell-cluster",
      "border-cell",
      "frame-cell",
      "underscore-cell",
      "normal-cell"
    );
    const key = getCellKey(td);
    if (cellsData[key]) {
      td.textContent = cellsData[key];
    } else {
      td.textContent = "";
    }
  });
}
