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
  // 1) Collect all non-empty (filled) cell positions:
  //    We simply rely on grid.getFilledCells(), which only returns genuinely filled cells.
  const filledPoints = grid.getFilledCells().map(({ row, col }) => ({
    row,
    col,
  }));

  // 2) Build “containers” of filled cells with outline expand=2 => Blocks
  const containers = getContainers(filledPoints, 2, grid.rows, grid.cols);
  const blockList: Block[] = containers.map(finalizeBlock);

  // Prepare our style map:
  const styleMap: StyleMap = {};

  // 3) Compute each block's sub-lumps (cell clusters), then
  //    mark cluster‐empty vs. canvas‐empty cells.
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
    // store them on the block if needed
    (blk as any).cellClusters = cellClusters;

    // For each sub-lump bounding box => find "cluster-empty" cells
    const clusterEmptyCells: Array<{ row: number; col: number }> = [];
    for (const cluster of cellClusters) {
      // speed up membership checks:
      const clusterSet = new Set(cluster.map((pt) => pointKey(pt.row, pt.col)));

      const rr = cluster.map((p) => p.row);
      const cc = cluster.map((p) => p.col);
      const minR = Math.min(...rr);
      const maxR = Math.max(...rr);
      const minC = Math.min(...cc);
      const maxC = Math.max(...cc);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = pointKey(r, c);
          // If not in the cluster and the entire grid cell is empty
          //   (we confirm by checking raw text).
          if (!clusterSet.has(key) && grid.getCellRaw(r, c).trim() === "") {
            clusterEmptyCells.push({ row: r, col: c });
          }
        }
      }
    }

    // "canvas‐empty" cells = bounding box minus the filled cluster
    const blockEmptyCells: Array<{ row: number; col: number }> = [];
    const fillSet = new Set(
      blk.canvasPoints.map((pt) => pointKey(pt.row, pt.col))
    );
    for (let r = blk.topRow; r <= blk.bottomRow; r++) {
      for (let c = blk.leftCol; c <= blk.rightCol; c++) {
        const k = pointKey(r, c);
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
      const k = pointKey(pt.row, pt.col);
      // Only add "canvas-empty-cell" if not already cluster-empty
      if (!styleMap[k]?.includes("cluster-empty-cell")) {
        addClass(styleMap, pt.row, pt.col, "canvas-empty-cell");
      }
    }
  }

  // 4) BlockJoins => BlockClusters => locked/linked
  const allJoins = BlockJoin.populateBlockJoins(blockList);
  const blockClusters = BlockCluster.populateBlockClusters(blockList, allJoins);

  // 5) Mark locked/linked cells from blockClusters
  for (const bc of blockClusters) {
    for (const pt of bc.linkedPoints) {
      addClass(styleMap, pt.row, pt.col, "linked-cell");
    }
    for (const pt of bc.lockedPoints) {
      addClass(styleMap, pt.row, pt.col, "locked-cell");
    }
  }

  // 6) Finally, apply “canvas‐cell”, “border‐cell”, “frame‐cell” for each block
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
  if (filledPoints.length === 0) return [];

  const containers: Container[] = [];
  // faster membership checks:
  const used = new Set<string>();
  // We’ll keep a Set as well for quick membership.
  const allPoints = new Set(filledPoints.map((p) => pointKey(p.row, p.col)));

  for (const cell of filledPoints) {
    const key = pointKey(cell.row, cell.col);
    if (used.has(key)) continue; // skip if already in a container

    const tempContainer = new Container(cell.row, cell.col, cell.row, cell.col);
    const containerSet = new Set<string>();
    containerSet.add(key);
    tempContainer.filledPoints.push(cell);

    // BFS/merge approach:
    let newlyAdded: boolean;
    do {
      newlyAdded = false;
      // expand bounding box by expandOutlineBy
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      // gather any points that overlap
      for (const ptStr of allPoints) {
        if (!containerSet.has(ptStr)) {
          const { row, col } = parsePoint(ptStr);
          if (expanded.overlaps(new Container(row, col, row, col))) {
            containerSet.add(ptStr);
            tempContainer.filledPoints.push({ row, col });
            newlyAdded = true;
          }
        }
      }

      if (newlyAdded) {
        // unify bounding box
        const rows = tempContainer.filledPoints.map((p) => p.row);
        const cols = tempContainer.filledPoints.map((p) => p.col);
        tempContainer.topRow = Math.min(...rows);
        tempContainer.bottomRow = Math.max(...rows);
        tempContainer.leftColumn = Math.min(...cols);
        tempContainer.rightColumn = Math.max(...cols);
      }
    } while (newlyAdded);

    // Mark everything in this container as used
    for (const ptStr of containerSet) {
      used.add(ptStr);
    }

    // Now also check if we overlap existing containers => merge
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
          // unify bounding box & points
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
          for (const fp of c.filledPoints) {
            const s = pointKey(fp.row, fp.col);
            if (!containerSet.has(s)) {
              containerSet.add(s);
              tempContainer.filledPoints.push(fp);
            }
          }
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
  const seen = new Set<string>();
  const out: Array<{ row: number; col: number }> = [];
  for (const p of arr) {
    const k = pointKey(p.row, p.col);
    if (!seen.has(k)) {
      seen.add(k);
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
  const key = pointKey(row, col);
  if (!styleMap[key]) {
    styleMap[key] = [];
  }
  if (!styleMap[key].includes(className)) {
    styleMap[key].push(className);
  }
}

/** Helper to convert row,col => "R{row}C{col}". */
function pointKey(row: number, col: number): string {
  return `R${row}C${col}`;
}

/** Helper to parse a "R{row}C{col}" string. */
function parsePoint(str: string): { row: number; col: number } {
  const m = /^R(\d+)C(\d+)$/.exec(str);
  if (!m) throw new Error(`Invalid point key: ${str}`);
  return { row: parseInt(m[1], 10), col: parseInt(m[2], 10) };
}
