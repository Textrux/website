import { Grid } from "../structure/Grid";
import Block from "../structure/Block";
import Container from "../structure/Container";

/** Key = "R{row}C{col}" => array of class names */
interface StyleMap {
  [key: string]: string[];
}

/**
 * Scan the grid for non-empty cells => create containers => finalize blocks => produce a style map.
 * Now we only iterate over grid’s contentsMap.
 */
export function parseAndFormatGrid(grid: Grid): Record<string, string[]> {
  const styleMap: StyleMap = {};

  // (1) Collect all non-empty (filled) cell positions:
  const filledPoints: Array<{ row: number; col: number }> = [];
  // We rely on the fact that `grid.getCellRaw(...)` can be tested for non-empty
  // or we can parse the keys from grid’s internal structure. For simplicity:
  const allKeys = Object.keys((grid as any).contentsMap); // TS hack; or add a getter
  for (const key of allKeys) {
    // e.g. key = "R10C5"
    const raw = (grid as any).contentsMap[key];
    if (raw.trim() !== "") {
      const match = key.match(/^R(\d+)C(\d+)$/);
      if (match) {
        const r = parseInt(match[1], 10);
        const c = parseInt(match[2], 10);
        filledPoints.push({ row: r, col: c });
      }
    }
  }

  // (2) Build containers from these points:
  const containers = getContainers(filledPoints, 2, grid.rows, grid.cols);

  // (3) Convert each Container -> Block -> styleMap
  const blocks = containers.map(finalizeBlock);
  for (const b of blocks) {
    // canvas
    for (const pt of b.canvasPoints) {
      addClass(styleMap, pt.row, pt.col, "canvas-cell");
    }
    // border
    for (const pt of b.borderPoints) {
      addClass(styleMap, pt.row, pt.col, "border-cell");
    }
    // frame
    for (const pt of b.framePoints) {
      addClass(styleMap, pt.row, pt.col, "frame-cell");
    }
  }

  return styleMap;
}

// This is the same “container detection” logic but with row/col pairs:
function getContainers(
  filledPoints: Array<{ row: number; col: number }>,
  expandOutlineBy: number,
  rowCount: number,
  colCount: number
): Container[] {
  const containers: Container[] = [];
  const overlappedPoints: Array<{ row: number; col: number }> = [];
  const remaining = [...filledPoints];

  for (const cell of filledPoints) {
    const alreadyOverlapped = overlappedPoints.some(
      (p) => p.row === cell.row && p.col === cell.col
    );
    if (alreadyOverlapped) continue;

    // Start a container with just this one point:
    const tempContainer = new Container(cell.row, cell.col, cell.row, cell.col);
    tempContainer.filledPoints.push(cell);

    const allOverlapping: Array<{ row: number; col: number }> = [];
    let newOverlaps: Array<{ row: number; col: number }>;

    // Expand until no new overlaps
    do {
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );
      newOverlaps = remaining.filter((pt) => {
        // if we already used that point
        if (pt === cell) return false;
        if (allOverlapping.some((x) => x.row === pt.row && x.col === pt.col)) {
          return false;
        }
        const singleC = new Container(pt.row, pt.col, pt.row, pt.col);
        return expanded.overlaps(singleC);
      });
      if (newOverlaps.length > 0) {
        overlappedPoints.push(...newOverlaps);

        // Adjust bounding box:
        const minR = Math.min(
          tempContainer.topRow,
          ...newOverlaps.map((p) => p.row)
        );
        const maxR = Math.max(
          tempContainer.bottomRow,
          ...newOverlaps.map((p) => p.row)
        );
        const minC = Math.min(
          tempContainer.leftColumn,
          ...newOverlaps.map((p) => p.col)
        );
        const maxC = Math.max(
          tempContainer.rightColumn,
          ...newOverlaps.map((p) => p.col)
        );
        tempContainer.topRow = minR;
        tempContainer.bottomRow = maxR;
        tempContainer.leftColumn = minC;
        tempContainer.rightColumn = maxC;

        tempContainer.filledPoints.push(...newOverlaps);
        allOverlapping.push(...newOverlaps);
      }
    } while (newOverlaps.length > 0);

    // Merge with existing containers that overlap:
    let mergedSomething: boolean;
    do {
      mergedSomething = false;
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );
      const overlappedExisting = containers.filter((cc) =>
        cc.overlaps(expanded)
      );
      if (overlappedExisting.length > 0) {
        mergedSomething = true;
        for (const oc of overlappedExisting) {
          // remove oc from containers
          const idx = containers.indexOf(oc);
          if (idx !== -1) containers.splice(idx, 1);

          // expand our container to include oc
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

          tempContainer.filledPoints.push(...oc.filledPoints);
        }
      }
    } while (mergedSomething);

    containers.push(tempContainer);
  }

  // sort for consistency
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  return containers;
}

function finalizeBlock(cont: Container): Block {
  const b = new Block(cont);

  // The container's filledPoints => block’s canvas
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
