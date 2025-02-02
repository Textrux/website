/****************************************************
 * parsing.js
 *
 * 1) We define a single "Container" class (no duplicates).
 * 2) We define getContainersJS(...) which implements your
 *    Linqpad "GetContainers" logic.
 * 3) We identify blocks by calling getContainersJS(filledCells,2,...).
 * 4) For each block, we identify cell-clusters by calling
 *    getContainersJS(block.canvasCells,1,...).
 * 5) We fill in Treet logic for block joins => locked/linked, etc.
 * 6) Finally, we define parseAndFormatGrid as a global function on window.
 *
 * ***IMPORTANT***: Load this file before script.js or
 *    any file that calls parseAndFormatGrid.
 ****************************************************/

/****************************************************
 *  GLOBAL ARRAYS that script.js expects:
 ****************************************************/
let blockJoins = [];
let blockClusters = [];

/****************************************************
 * parseAndFormatGrid (global)
 ****************************************************/
window.parseAndFormatGrid = function parseAndFormatGrid() {
  // Reset references (script.js uses these too)
  cellToBlockMap = {};
  blockList = [];
  blockJoins = [];
  blockClusters = [];

  // 1) Gather all "filledCells" from cellsData
  const filledCells = [];
  for (let key in cellsData) {
    const val = cellsData[key];
    if (val && val.trim() !== "") {
      let m = key.match(/R(\d+)C(\d+)/);
      if (m) {
        filledCells.push({
          row: parseInt(m[1]),
          col: parseInt(m[2]),
          key,
        });
      }
    }
  }

  // 2) Clear old formatting
  clearFormatting();

  // 3) Build "blocks" by getContainersJS(...) with expand=2
  const blockContainers = getContainersJS(
    filledCells,
    2,
    numberOfRows,
    numberOfColumns
  );

  // Convert each container => a Treet "Block"
  blockList = blockContainers.map((cont) => {
    // Build a block object
    const block = {
      canvasCells: cont.filledPoints.map((pt) => ({
        row: pt.row,
        col: pt.col,
      })),
      emptyCanvasCells: [],
      emptyClusterCells: [],
      cellClusters: [],
      borderCells: [],
      frameCells: [],
      topRow: cont.topRow,
      bottomRow: cont.bottomRow,
      leftCol: cont.leftColumn,
      rightCol: cont.rightColumn,
    };
    // populate cellToBlockMap for each filled cell
    for (let pt of block.canvasCells) {
      const k = `${pt.row},${pt.col}`;
      cellToBlockMap[k] = block;
    }
    return block;
  });

  // 4) finalize each block => do sub-lumps for cell clusters
  for (let b of blockList) {
    finalizeBlock(b);
  }

  // 5) block joins => locked/linked
  populateBlockJoins();

  // 6) block clusters => BFS on blockJoins
  populateBlockClusters();

  // 7) final styling
  applyBlockStyles(filledCells);
};

/****************************************************
 * finalizeBlock(b)
 *   - bounding box => emptyCanvasCells
 *   - cellClusters => getContainersJS(b.canvasCells,1,...)
 *   - find cluster-empty cells => bounding box
 *   - border/frame => getOutlineCells
 ****************************************************/
function finalizeBlock(b) {
  // bounding box => emptyCanvasCells
  const fillSet = new Set(b.canvasCells.map((pt) => `${pt.row},${pt.col}`));
  for (let r = b.topRow; r <= b.bottomRow; r++) {
    for (let c = b.leftCol; c <= b.rightCol; c++) {
      const k = `${r},${c}`;
      if (!fillSet.has(k)) {
        b.emptyCanvasCells.push({ row: r, col: c });
        cellToBlockMap[k] = b;
      }
    }
  }

  // find sub-lumps of filled => cell clusters with expand=1
  const clusterContainers = getContainersJS(
    b.canvasCells,
    1,
    numberOfRows,
    numberOfColumns
  );
  // each container => topRow, leftCol, bottomRow, rightCol, filledPoints

  // convert each container => array of {row,col}
  b.cellClusters = clusterContainers.map((cont) =>
    cont.filledPoints.map((p) => ({ row: p.row, col: p.col }))
  );

  // find cluster-empty => for each cluster bounding box
  b.emptyClusterCells = [];
  for (let cluster of b.cellClusters) {
    let minR = Math.min(...cluster.map((p) => p.row));
    let maxR = Math.max(...cluster.map((p) => p.row));
    let minC = Math.min(...cluster.map((p) => p.col));
    let maxC = Math.max(...cluster.map((p) => p.col));
    for (let rr = minR; rr <= maxR; rr++) {
      for (let cc = minC; cc <= maxC; cc++) {
        if (!cluster.some((pt) => pt.row === rr && pt.col === cc)) {
          // if not in cellsData => cluster-empty
          if (!cellsData[`R${rr}C${cc}`]) {
            b.emptyClusterCells.push({ row: rr, col: cc });
          }
        }
      }
    }
  }

  // border=> getOutline(1), frame=> getOutline(2)
  b.borderCells = getOutlineCells(
    b.topRow,
    b.bottomRow,
    b.leftCol,
    b.rightCol,
    1,
    cellToBlockMap,
    b
  );
  b.frameCells = getOutlineCells(
    b.topRow,
    b.bottomRow,
    b.leftCol,
    b.rightCol,
    2,
    cellToBlockMap,
    b
  );
}

/****************************************************
 * getContainersJS
 *   JavaScript version of your Linqpad "GetContainers"
 ****************************************************/
function getContainersJS(filledPoints, expandOutlineBy, rowCount, colCount) {
  let containers = [];
  let overlappedPoints = [];
  let remainingPoints = [...filledPoints];

  for (let cell of filledPoints) {
    // skip if we've already merged it
    if (
      overlappedPoints.some((p) => p.row === cell.row && p.col === cell.col)
    ) {
      continue;
    }

    // create a container from this point
    let tempContainer = createContainerFromPoint(cell);
    let tempExpanded = tempContainer;

    let allCellsOverlappingThisContainer = [];
    let cellsOverlappingThisContainer = [];

    // (A) Merge other FILLed points that overlap the expanded bounding box
    do {
      let expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      tempExpanded = expanded;

      // find any other points that overlap
      cellsOverlappingThisContainer = remainingPoints.filter((p) => {
        if (p === cell) return false;
        if (
          allCellsOverlappingThisContainer.some(
            (pp) => pp.row === p.row && pp.col === p.col
          )
        ) {
          return false;
        }
        let singleC = createContainerFromPoint(p);
        return expanded.overlaps(singleC);
      });

      if (cellsOverlappingThisContainer.length > 0) {
        overlappedPoints.push(...cellsOverlappingThisContainer);

        // unify bounding box
        let minR = Math.min(
          tempContainer.topRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        let maxR = Math.max(
          tempContainer.bottomRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        let minC = Math.min(
          tempContainer.leftColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );
        let maxC = Math.max(
          tempContainer.rightColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );

        tempContainer.topRow = minR;
        tempContainer.bottomRow = maxR;
        tempContainer.leftColumn = minC;
        tempContainer.rightColumn = maxC;

        // unify filledPoints
        tempContainer.filledPoints.push(...cellsOverlappingThisContainer);
        allCellsOverlappingThisContainer.push(...cellsOverlappingThisContainer);
      }
    } while (cellsOverlappingThisContainer.length > 0);

    // (B) Merge repeatedly with EXISTING containers
    let mergedSomething;
    do {
      mergedSomething = false;

      // see which containers overlap our tempContainer
      let overlappedExisting = containers.filter((cc) =>
        tempExpanded.overlaps(cc)
      );

      if (overlappedExisting.length > 0) {
        mergedSomething = true;
        // unify with each overlapped container
        for (let oc of overlappedExisting) {
          // remove oc from containers
          containers = containers.filter((xx) => xx !== oc);

          // unify bounding box
          tempContainer.topRow = Math.min(tempContainer.topRow, oc.topRow);
          tempContainer.bottomRow = Math.max(
            tempContainer.bottomRow,
            oc.bottomRow
          );
          tempContainer.leftColumn = Math.min(
            tempContainer.leftColumn,
            oc.leftColumn
          );
          tempContainer.rightColumn = Math.max(
            tempContainer.rightColumn,
            oc.rightColumn
          );

          // unify filledPoints
          tempContainer.filledPoints.push(...oc.filledPoints);
        }
      }
      // after merging, we loop again to see if the bigger bounding box
      // overlaps another container we haven't merged with yet
    } while (mergedSomething);

    // now that we've merged with everything possible, push the final container
    containers.push(tempContainer);
  }

  // sort or do whatever you normally do
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  return containers;
}

/****************************************************
 * Container class to match your C# approach
 ****************************************************/
class Container {
  constructor(top, left, bottom, right) {
    this.topRow = top;
    this.leftColumn = left;
    this.bottomRow = bottom;
    this.rightColumn = right;
    this.filledPoints = [];
  }

  expandOutlineBy(expand, rowCount, colCount) {
    const newTop = Math.max(1, this.topRow - expand);
    const newLeft = Math.max(1, this.leftColumn - expand);
    const newBottom = Math.min(rowCount, this.bottomRow + expand);
    const newRight = Math.min(colCount, this.rightColumn + expand);

    let c = new Container(newTop, newLeft, newBottom, newRight);
    c.filledPoints = [...this.filledPoints];
    return c;
  }

  overlaps(other) {
    if (this.topRow > other.bottomRow) return false;
    if (other.topRow > this.bottomRow) return false;
    if (this.leftColumn > other.rightColumn) return false;
    if (other.leftColumn > this.rightColumn) return false;
    return true;
  }
}

function createContainerFromPoint(pt) {
  let c = new Container(pt.row, pt.col, pt.row, pt.col);
  c.filledPoints.push(pt);
  return c;
}

/****************************************************
 * populateBlockJoins => locked or linked
 ****************************************************/
function populateBlockJoins() {
  blockJoins = [];
  for (let i = 0; i < blockList.length; i++) {
    for (let j = i + 1; j < blockList.length; j++) {
      let A = blockList[i];
      let B = blockList[j];
      if (
        !containersOverlap(
          A.frameCells,
          B.frameCells,
          A.borderCells,
          B.borderCells
        )
      ) {
        continue;
      }
      let join = {
        blocks: [A, B],
        type: "linked",
        linkedCells: [],
        lockedCells: [],
        allJoinedCells: [],
      };
      let ff = overlapPoints(A.frameCells, B.frameCells);
      let bfAB = overlapPoints(A.borderCells, B.frameCells);
      let bfBA = overlapPoints(A.frameCells, B.borderCells);
      let locked = deduplicatePoints([...bfAB, ...bfBA]);
      let linked = ff;
      if (locked.length > 0) {
        join.type = "locked";
        join.lockedCells = locked;
        join.linkedCells = linked;
      } else {
        join.type = "linked";
        join.linkedCells = linked;
      }
      join.allJoinedCells = deduplicatePoints([...locked, ...linked]);
      if (join.allJoinedCells.length > 0) {
        blockJoins.push(join);
      }
    }
  }
}

/****************************************************
 * populateBlockClusters => BFS on blockJoins
 ****************************************************/
function populateBlockClusters() {
  let used = new Set();
  for (let block of blockList) {
    if (used.has(block)) continue;
    let clusterBlocks = [];
    let clusterJoins = [];
    gatherCluster(block, clusterBlocks, clusterJoins);

    let allCanvas = [];
    clusterBlocks.forEach((b) => {
      allCanvas.push(...b.canvasCells);
    });
    let minR = Math.min(...allCanvas.map((pt) => pt.row));
    let maxR = Math.max(...allCanvas.map((pt) => pt.row));
    let minC = Math.min(...allCanvas.map((pt) => pt.col));
    let maxC = Math.max(...allCanvas.map((pt) => pt.col));

    let linkedAll = [];
    let lockedAll = [];
    clusterJoins.forEach((jn) => {
      linkedAll.push(...jn.linkedCells);
      lockedAll.push(...jn.lockedCells);
    });
    let mergedLinked = deduplicatePoints(linkedAll);
    let mergedLocked = deduplicatePoints(lockedAll);

    blockClusters.push({
      blocks: clusterBlocks,
      blockJoins: clusterJoins,
      clusterCanvas: { top: minR, left: minC, bottom: maxR, right: maxC },
      linkedCells: mergedLinked,
      lockedCells: mergedLocked,
    });
    clusterBlocks.forEach((b) => used.add(b));
  }
}

function gatherCluster(start, clusterBlocks, clusterJoins) {
  let queue = [start];
  let visited = new Set();
  while (queue.length) {
    let blk = queue.shift();
    if (visited.has(blk)) continue;
    visited.add(blk);
    clusterBlocks.push(blk);

    let myJoins = blockJoins.filter((j) => j.blocks.includes(blk));
    for (let jn of myJoins) {
      if (!clusterJoins.includes(jn)) clusterJoins.push(jn);
      let other = jn.blocks.find((b) => b !== blk);
      if (!visited.has(other)) {
        queue.push(other);
      }
    }
  }
}

/****************************************************
 * applyBlockStyles(filledCells)
 ****************************************************/
function applyBlockStyles(filledCells) {
  for (let b of blockList) {
    for (let pt of b.emptyClusterCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("cluster-empty-cell");
    }
    // the rest => canvas-empty
    for (let r = b.topRow; r <= b.bottomRow; r++) {
      for (let c = b.leftCol; c <= b.rightCol; c++) {
        let key = `R${r}C${c}`;
        if (!cellsData[key]) {
          let td = getCellElement(r, c);
          if (td && !td.classList.contains("cluster-empty-cell")) {
            td.classList.add("canvas-empty-cell");
          }
        }
      }
    }
  }

  // locked & linked
  for (let bc of blockClusters) {
    for (let pt of bc.lockedCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("locked-cell");
    }
    for (let pt of bc.linkedCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td && !td.classList.contains("locked-cell")) {
        td.classList.add("linked-cell");
      }
    }
  }

  // fill text for actual filled
  for (let fc of filledCells) {
    let td = getCellElement(fc.row, fc.col);
    if (td) {
      td.textContent = cellsData[fc.key];
      td.classList.add("canvas-cell");
    }
  }

  // re-apply border/frame
  for (let b of blockList) {
    for (let pt of b.borderCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("border-cell");
    }
    for (let pt of b.frameCells) {
      let td = getCellElement(pt.row, pt.col);
      if (td) td.classList.add("frame-cell");
    }
  }
}

/****************************************************
 * getOutlineCells => border/frame expansions
 ****************************************************/
function getOutlineCells(
  top,
  bottom,
  left,
  right,
  expandBy,
  cellMap,
  currentBlock
) {
  let outline = [];
  let rowCount = numberOfRows;
  let columnCount = numberOfColumns;

  // Top
  if (top - expandBy >= 1) {
    let cols = Array.from(
      {
        length:
          Math.min(right + expandBy, columnCount) -
          Math.max(left - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(left - expandBy, 1) + i
    );
    let rows = Array(cols.length).fill(top - expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })));
  }

  // Right
  if (right + expandBy <= columnCount) {
    let rows = Array.from(
      {
        length:
          Math.min(bottom + expandBy, rowCount) -
          Math.max(top - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(top - expandBy, 1) + i
    );
    let cols = Array(rows.length).fill(right + expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })));
  }

  // Bottom
  if (bottom + expandBy <= rowCount) {
    let cols = Array.from(
      {
        length:
          Math.min(right + expandBy, columnCount) -
          Math.max(left - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(left - expandBy, 1) + i
    );
    let rows = Array(cols.length).fill(bottom + expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })).reverse());
  }

  // Left
  if (left - expandBy >= 1) {
    let rows = Array.from(
      {
        length:
          Math.min(bottom + expandBy, rowCount) -
          Math.max(top - expandBy, 1) +
          1,
      },
      (_, i) => Math.max(top - expandBy, 1) + i
    );
    let cols = Array(rows.length).fill(left - expandBy);
    outline.push(...rows.map((row, i) => ({ row, col: cols[i] })).reverse());
  }

  // Remove duplicates and return
  return Array.from(new Set(outline.map(JSON.stringify)), JSON.parse);
}

/****************************************************
 * areCanvasesWithinProximity => merges blocks, distance=2
 ****************************************************/
function areCanvasesWithinProximity(a, b, proximity) {
  let vert = 0;
  if (a.bottomRow < b.topRow) {
    vert = b.topRow - a.bottomRow - 1;
  } else if (b.bottomRow < a.topRow) {
    vert = a.topRow - b.bottomRow - 1;
  } else {
    vert = 0;
  }
  let horiz = 0;
  if (a.rightCol < b.leftCol) {
    horiz = b.leftCol - a.rightCol - 1;
  } else if (b.rightCol < a.leftCol) {
    horiz = a.leftCol - b.rightCol - 1;
  } else {
    horiz = 0;
  }
  return vert < proximity && horiz < proximity;
}

/****************************************************
 * containersOverlap => locked vs linked
 ****************************************************/
function containersOverlap(frameA, frameB, borderA, borderB) {
  let ff = overlapPoints(frameA, frameB);
  let ab = overlapPoints(borderA, frameB);
  let ba = overlapPoints(frameA, borderB);
  return ff.length > 0 || ab.length > 0 || ba.length > 0;
}

/****************************************************
 * overlapPoints(listA,listB)
 ****************************************************/
function overlapPoints(listA, listB) {
  const setB = new Set(listB.map((p) => `${p.row},${p.col}`));
  let out = [];
  for (let p of listA) {
    let k = `${p.row},${p.col}`;
    if (setB.has(k)) {
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * deduplicatePoints
 ****************************************************/
function deduplicatePoints(arr) {
  let used = new Set();
  let out = [];
  for (let p of arr) {
    let k = `${p.row},${p.col}`;
    if (!used.has(k)) {
      used.add(k);
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * getNeighbors(r,c,dist=1)
 * => up to 8 directions
 ****************************************************/
function getNeighbors(r, c, dist) {
  let out = [];
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr;
      let nc = c + dc;
      if (nr >= 1 && nr <= numberOfRows && nc >= 1 && nc <= numberOfColumns) {
        out.push({ row: nr, col: nc });
      }
    }
  }
  return out;
}

/****************************************************
 * clearFormatting
 ****************************************************/
function clearFormatting() {
  const allTds = document.querySelectorAll("#spreadsheet td");
  allTds.forEach((td) => {
    td.classList.remove(
      "selected",
      "canvas-cell",
      "empty-cell-cluster",
      "cluster-empty-cell",
      "canvas-empty-cell",
      "border-cell",
      "frame-cell",
      "underscore-cell",
      "normal-cell",
      "locked-cell",
      "linked-cell"
    );
    let r = td.getAttribute("data-row");
    let c = td.getAttribute("data-col");
    let key = `R${r}C${c}`;
    if (cellsData[key]) {
      td.textContent = cellsData[key];
    } else {
      td.textContent = "";
    }
  });
}
