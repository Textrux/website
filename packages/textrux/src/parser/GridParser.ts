// packages/textrux/src/parser/GridParser.ts

import { Grid } from "../structure/Grid";
import Block from "../structure/Block";
import Container from "../structure/Container";
import BlockJoin from "../structure/BlockJoin";
import BlockCluster from "../structure/BlockCluster";

/** Key = "R{row}C{col}" => array of class names */
interface StyleMap {
  [key: string]: string[];
}

/**
 * Scan the grid for non-empty cells => create containers => finalize blocks =>
 * produce a style map. Then also compute BlockJoins => BlockClusters and add
 * locked/linked formatting. Finally, identify “empty cluster” cells as well as
 * “canvas-empty” cells.
 *
 * Returned styleMap can then be used by the UI layer to add classes to each cell.
 */
export function parseAndFormatGrid(grid: Grid): {
  styleMap: Record<string, string[]>;
  blockList: Block[];
} {
  // console.time("parseAndFormatGrid");
  const styleMap: StyleMap = {};

  // 1) Collect all non-empty (filled) cell positions:
  const filledPoints: Array<{ row: number; col: number }> = [];
  const contentsKeys = Object.keys((grid as any).contentsMap);
  for (const key of contentsKeys) {
    const val = (grid as any).contentsMap[key];
    if (val && val.trim() !== "") {
      const m = key.match(/^R(\d+)C(\d+)$/);
      if (m) {
        const r = parseInt(m[1], 10);
        const c = parseInt(m[2], 10);
        filledPoints.push({ row: r, col: c });
      }
    }
  }

  // 2) Build “containers” of filled cells with an outline expand=2 => Blocks
  const containers = getContainers(filledPoints, 2, grid.rows, grid.cols);
  const blockList: Block[] = containers.map(finalizeBlock);

  // 3) Also compute sub-lumps (“cell clusters”) inside each block
  //    (these lumps are the contiguous lumps of the block’s “canvasPoints” with expand=1).
  for (const blk of blockList) {
    // get sub-containers with expand=1 from all the block’s canvasPoints
    const subContainers = getContainers(
      blk.canvasPoints,
      1,
      grid.rows,
      grid.cols
    );
    // each sub-container => array of filled points
    const cellClusters = subContainers.map((ctr) => ctr.filledPoints);
    // we can store them on the block if needed:
    (blk as any).cellClusters = cellClusters;

    // For each sub-lump bounding box => find “cluster‐empty” cells
    // optional, if you want the same highlight as the old code:
    const clusterEmptyCells: Array<{ row: number; col: number }> = [];
    for (const cluster of cellClusters) {
      const rr = cluster.map((p) => p.row);
      const cc = cluster.map((p) => p.col);
      const minR = Math.min(...rr);
      const maxR = Math.max(...rr);
      const minC = Math.min(...cc);
      const maxC = Math.max(...cc);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          // If not actually in the cluster (i.e., not a filled cell) AND not empty in the entire sheet
          const isFilled = cluster.some((pt) => pt.row === r && pt.col === c);
          const cellKey = `R${r}C${c}`;
          const entireSheetVal = (grid as any).contentsMap[cellKey] ?? "";
          if (!isFilled && !entireSheetVal.trim()) {
            clusterEmptyCells.push({ row: r, col: c });
          }
        }
      }
    }

    // Then also for the block’s bounding rectangle => we can highlight
    // “canvas‐empty” cells (the block’s bounding box minus the filled cluster).
    const blockEmptyCells: Array<{ row: number; col: number }> = [];
    const fillSet = new Set(
      blk.canvasPoints.map((pt) => `${pt.row},${pt.col}`)
    );
    for (let r = blk.topRow; r <= blk.bottomRow; r++) {
      for (let c = blk.leftCol; c <= blk.rightCol; c++) {
        const k = `${r},${c}`;
        if (!fillSet.has(k)) {
          // not a filled cell
          blockEmptyCells.push({ row: r, col: c });
        }
      }
    }

    // Apply “cluster-empty-cell” and “canvas-empty-cell” to styleMap
    for (const pt of clusterEmptyCells) {
      addClass(styleMap, pt.row, pt.col, "cluster-empty-cell");
    }
    for (const pt of blockEmptyCells) {
      // Only add "canvas-empty-cell" if not already cluster-empty
      const k = `R${pt.row}C${pt.col}`;
      if (!styleMap[k]?.includes("cluster-empty-cell")) {
        addClass(styleMap, pt.row, pt.col, "canvas-empty-cell");
      }
    }
  }

  // 4) Now populate all blockJoins => blockClusters
  const allJoins = BlockJoin.populateBlockJoins(blockList);
  const blockClusters = BlockCluster.populateBlockClusters(blockList, allJoins);

  // 5) Mark locked/linked cells from the blockClusters
  for (const bc of blockClusters) {
    for (const pt of bc.linkedPoints) {
      addClass(styleMap, pt.row, pt.col, "linked-cell");
    }
    for (const pt of bc.lockedPoints) {
      addClass(styleMap, pt.row, pt.col, "locked-cell");
    }
  }

  // 6) Finally, apply “canvas‐cell”, “border‐cell”, “frame‐cell” for each block
  //    (we already do the .canvasPoints in finalizeBlock).
  for (const b of blockList) {
    for (const pt of b.canvasPoints) {
      addClass(styleMap, pt.row, pt.col, "canvas-cell");
    }
    for (const pt of b.borderPoints) {
      addClass(styleMap, pt.row, pt.col, "border-cell");
    }
    for (const pt of b.framePoints) {
      addClass(styleMap, pt.row, pt.col, "frame-cell");
    }
  }

  // console.timeEnd("parseAndFormatGrid");
  return { styleMap, blockList };
}

/**
 * Convert an array of filledPoints => one or more Container bounding boxes,
 * expanded by `expandOutlineBy`.
 */
function getContainers(
  filledPoints: Array<{ row: number; col: number }>,
  expandOutlineBy: number,
  rowCount: number,
  colCount: number
): Container[] {
  const containers: Container[] = [];
  const usedPoints: Array<{ row: number; col: number }> = [];
  const allRemaining = [...filledPoints];

  for (const cell of filledPoints) {
    // if we already used it in some container, skip
    if (usedPoints.some((p) => p.row === cell.row && p.col === cell.col)) {
      continue;
    }

    const tempContainer = new Container(cell.row, cell.col, cell.row, cell.col);
    tempContainer.filledPoints.push(cell);

    // BFS/merge approach:
    const newlyOverlapped: Array<{ row: number; col: number }> = [];
    do {
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );
      newlyOverlapped.length = 0; // reset

      // gather any points that overlap that bounding box
      for (const pt of allRemaining) {
        if (
          !usedPoints.includes(pt) &&
          !tempContainer.filledPoints.includes(pt)
        ) {
          const single = new Container(pt.row, pt.col, pt.row, pt.col);
          if (expanded.overlaps(single)) {
            newlyOverlapped.push(pt);
          }
        }
      }

      if (newlyOverlapped.length > 0) {
        usedPoints.push(...newlyOverlapped);

        // unify bounding box
        const minR = Math.min(
          tempContainer.topRow,
          ...newlyOverlapped.map((p) => p.row)
        );
        const maxR = Math.max(
          tempContainer.bottomRow,
          ...newlyOverlapped.map((p) => p.row)
        );
        const minC = Math.min(
          tempContainer.leftColumn,
          ...newlyOverlapped.map((p) => p.col)
        );
        const maxC = Math.max(
          tempContainer.rightColumn,
          ...newlyOverlapped.map((p) => p.col)
        );

        tempContainer.topRow = minR;
        tempContainer.bottomRow = maxR;
        tempContainer.leftColumn = minC;
        tempContainer.rightColumn = maxC;

        tempContainer.filledPoints.push(...newlyOverlapped);
      }
    } while (newlyOverlapped.length > 0);

    // Now also check if we overlap existing containers
    let merged = true;
    while (merged) {
      merged = false;
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      for (let i = containers.length - 1; i >= 0; i--) {
        const c = containers[i];
        if (expanded.overlaps(c)) {
          // remove from containers, unify bounding box & points
          containers.splice(i, 1);
          tempContainer.topRow = Math.min(tempContainer.topRow, c.topRow);
          tempContainer.bottomRow = Math.max(
            tempContainer.bottomRow,
            c.bottomRow
          );
          tempContainer.leftColumn = Math.min(
            tempContainer.leftColumn,
            c.leftColumn
          );
          tempContainer.rightColumn = Math.max(
            tempContainer.rightColumn,
            c.rightColumn
          );
          tempContainer.filledPoints.push(...c.filledPoints);
          merged = true;
        }
      }
    }

    containers.push(tempContainer);
  }

  // sort for consistent order
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  return containers;
}

/**
 * Convert a Container => a Block object (canvas, border, frame).
 */
function finalizeBlock(cont: Container): Block {
  const b = new Block(cont);

  // The container's filledPoints => block's canvasPoints
  b.canvasPoints = [...cont.filledPoints];

  // Build border ring => 1 cell around
  const br1 = b.topRow - 1;
  const br2 = b.bottomRow + 1;
  const bc1 = b.leftCol - 1;
  const bc2 = b.rightCol + 1;
  const borderPts: Array<{ row: number; col: number }> = [];
  for (let c = bc1; c <= bc2; c++) {
    borderPts.push({ row: br1, col: c });
    borderPts.push({ row: br2, col: c });
  }
  for (let r = br1; r <= br2; r++) {
    borderPts.push({ row: r, col: bc1 });
    borderPts.push({ row: r, col: bc2 });
  }
  b.borderPoints = dedupePoints(borderPts).filter(
    (p) => p.row > 0 && p.col > 0
  );

  // Build frame => 2 cells around
  const fr1 = br1 - 1;
  const fr2 = br2 + 1;
  const fc1 = bc1 - 1;
  const fc2 = bc2 + 1;
  const framePts: Array<{ row: number; col: number }> = [];
  for (let c = fc1; c <= fc2; c++) {
    framePts.push({ row: fr1, col: c });
    framePts.push({ row: fr2, col: c });
  }
  for (let r = fr1; r <= fr2; r++) {
    framePts.push({ row: r, col: fc1 });
    framePts.push({ row: r, col: fc2 });
  }
  b.framePoints = dedupePoints(framePts).filter((p) => p.row > 0 && p.col > 0);

  return b;
}

/** Deduplicate row,col points. */
function dedupePoints(
  arr: Array<{ row: number; col: number }>
): Array<{ row: number; col: number }> {
  const used = new Set<string>();
  const out: Array<{ row: number; col: number }> = [];
  for (const p of arr) {
    const k = `${p.row},${p.col}`;
    if (!used.has(k)) {
      used.add(k);
      out.push(p);
    }
  }
  return out;
}

/** Add a classname to styleMap if not already present. */
function addClass(
  styleMap: StyleMap,
  row: number,
  col: number,
  className: string
) {
  if (row < 1 || col < 1) return;
  const key = `R${row}C${col}`;
  if (!styleMap[key]) {
    styleMap[key] = [];
  }
  if (!styleMap[key].includes(className)) {
    styleMap[key].push(className);
  }
}
