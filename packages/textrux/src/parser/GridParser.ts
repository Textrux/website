// src/parser/GridParser.ts
import Grid from "../structure/Grid";
import Block from "../structure/Block";
import Container from "../structure/Container";
import Cell from "../structure/Cell";

interface StyleMap {
  [key: string]: string[];
}

/**
 * Scan the grid for non-empty cells => create containers => finalize blocks => produce a style map.
 */
export function parseAndFormatGrid(grid: Grid): Record<string, string[]> {
  // Fix: styleMap must be an object, not an array
  const styleMap: StyleMap = {};

  // Collect actual Cell objects that are non-empty:
  const filledCells: Cell[] = [];
  for (let r = 1; r <= grid.rows; r++) {
    for (let c = 1; c <= grid.cols; c++) {
      const cellObj = grid.getCellObject(r, c);
      if (!cellObj) continue;
      const cellVal = cellObj.contents.trim();
      if (cellVal !== "") {
        filledCells.push(cellObj);
      }
    }
  }

  // EXACT ALGORITHM from before, but now with Cell[]
  const containers = getContainers(filledCells, 2, grid.rows, grid.cols);

  // Convert each Container into a “Block” for final styling
  const blocks: Block[] = containers.map(finalizeBlock);

  // Mark the styleMap
  for (const b of blocks) {
    for (const pt of b.canvasCells) {
      addClass(styleMap, pt.row, pt.col, "canvas-cell");
    }
    for (const pt of b.borderCells) {
      addClass(styleMap, pt.row, pt.col, "border-cell");
    }
    for (const pt of b.frameCells) {
      addClass(styleMap, pt.row, pt.col, "frame-cell");
    }
  }

  return styleMap;
}

// EXACT ALGORITHM BELOW, now with `Cell[]` instead of raw points:
function getContainers(
  filledCells: Cell[],
  expandOutlineBy: number,
  rowCount: number,
  colCount: number
): Container[] {
  console.time("Total getContainersJS Execution Time");

  let containers: Container[] = [];
  const overlappedCells: Cell[] = [];
  const remainingCells = [...filledCells];

  for (const cell of filledCells) {
    // Skip if we already overlapped it
    if (overlappedCells.some((p) => p.row === cell.row && p.col === cell.col)) {
      continue;
    }

    const tempContainer = createContainerFromCell(cell);
    let tempExpanded = tempContainer;

    const allCellsOverlappingThisContainer: Cell[] = [];
    let cellsOverlappingThisContainer: Cell[] = [];

    do {
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );
      tempExpanded = expanded;

      cellsOverlappingThisContainer = remainingCells.filter((p) => {
        if (p === cell) return false;
        if (
          allCellsOverlappingThisContainer.some(
            (pp) => pp.row === p.row && pp.col === p.col
          )
        ) {
          return false;
        }
        const singleC = createContainerFromCell(p);
        return expanded.overlaps(singleC);
      });

      if (cellsOverlappingThisContainer.length > 0) {
        overlappedCells.push(...cellsOverlappingThisContainer);

        const minR = Math.min(
          tempContainer.topRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        const maxR = Math.max(
          tempContainer.bottomRow,
          ...cellsOverlappingThisContainer.map((p) => p.row)
        );
        const minC = Math.min(
          tempContainer.leftColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );
        const maxC = Math.max(
          tempContainer.rightColumn,
          ...cellsOverlappingThisContainer.map((p) => p.col)
        );

        tempContainer.topRow = minR;
        tempContainer.bottomRow = maxR;
        tempContainer.leftColumn = minC;
        tempContainer.rightColumn = maxC;

        tempContainer.filledCells.push(...cellsOverlappingThisContainer);
        allCellsOverlappingThisContainer.push(...cellsOverlappingThisContainer);
      }
    } while (cellsOverlappingThisContainer.length > 0);

    let mergedSomething: boolean;
    do {
      mergedSomething = false;

      // Check overlap with existing containers
      const overlappedExisting = containers.filter((cc) =>
        tempExpanded.overlaps(cc)
      );

      if (overlappedExisting.length > 0) {
        mergedSomething = true;
        for (const oc of overlappedExisting) {
          containers = containers.filter((xx) => xx !== oc);

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

          tempContainer.filledCells.push(...oc.filledCells);
        }
        tempExpanded = tempContainer.expandOutlineBy(
          expandOutlineBy,
          rowCount,
          colCount
        );
      }
    } while (mergedSomething);

    containers.push(tempContainer);
  }

  // Sort containers
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  console.timeEnd("Total getContainersJS Execution Time");
  return containers;
}

// Helper that constructs a Container from a single Cell
function createContainerFromCell(cell: Cell): Container {
  const c = new Container(cell.row, cell.col, cell.row, cell.col);
  c.filledCells.push(cell);
  return c;
}

// Turn each Container into a Block (canvas/border/frame) for styling:
function finalizeBlock(cont: Container): Block {
  const block: Block = new Block(cont);

  // The container’s filledCells become the block’s canvas:
  block.canvasCells = cont.filledCells;

  // We only need sets if we do any filtering, but here's an example:
  // const fillSet = new Set(cont.filledCells.map((pt) => `${pt.row},${pt.col}`));

  // Build the border ring => one cell around
  const br1 = block.topRow - 1;
  const br2 = block.bottomRow + 1;
  const bc1 = block.leftCol - 1;
  const bc2 = block.rightCol + 1;

  const borderPoints: Array<{ row: number; col: number }> = [];
  for (let cc = bc1; cc <= bc2; cc++) {
    borderPoints.push({ row: br1, col: cc });
    borderPoints.push({ row: br2, col: cc });
  }
  for (let rr = br1; rr <= br2; rr++) {
    borderPoints.push({ row: rr, col: bc1 });
    borderPoints.push({ row: rr, col: bc2 });
  }
  block.borderCells = dedupe(borderPoints).filter(
    (p) => p.row > 0 && p.col > 0
  );

  // Build the frame => two cells around
  const fr1 = br1 - 1;
  const fr2 = br2 + 1;
  const fc1 = bc1 - 1;
  const fc2 = bc2 + 1;

  const framePoints: Array<{ row: number; col: number }> = [];
  for (let cc = fc1; cc <= fc2; cc++) {
    framePoints.push({ row: fr1, col: cc });
    framePoints.push({ row: fr2, col: cc });
  }
  for (let rr = fr1; rr <= fr2; rr++) {
    framePoints.push({ row: rr, col: fc1 });
    framePoints.push({ row: rr, col: fc2 });
  }
  block.frameCells = dedupe(framePoints).filter((p) => p.row > 0 && p.col > 0);

  return block;
}

/** Dedupe an array of {row,col} objects. */
function dedupe(
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

/** Add a class to the styleMap for row/col. */
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
