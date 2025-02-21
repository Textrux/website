// packages/textrux/src/parser/GridParser.ts

import { PatternsManager } from "../pattern/PatternManager";

/**
 * Global cell data is in (window as any).cellsData
 */
export type CellsData = Record<string, string>;

/**
 * A basic point on the grid
 */
interface Point {
  row: number;
  col: number;
}

/**
 * Our bounding rectangle container
 */
interface Container {
  topRow: number;
  leftColumn: number;
  bottomRow: number;
  rightColumn: number;
  filledPoints: Point[];
}

/**
 * The final "block" object
 */
interface Block {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  canvasCells: Point[];
  borderCells: Point[];
  frameCells: Point[];
  cellClusters: Point[][];
  // etc.
}

/**
 * parseAndFormatGrid is called each time the app updates.
 * We read (window as any).cellsData, parse blocks, build styleMap,
 * store styleMap in (window as any).styleMap
 */
export function parseAndFormatGrid() {
  const cellsData = (window as any).cellsData || {};
  let rowCount = 1;
  let colCount = 1;

  // Gather "filledCells"
  const filledCells: { row: number; col: number; key: string }[] = [];
  for (const key in cellsData) {
    const m = key.match(/R(\d+)C(\d+)/);
    if (!m) continue;
    const r = parseInt(m[1], 10);
    const c = parseInt(m[2], 10);
    if (r > rowCount) rowCount = r;
    if (c > colCount) colCount = c;
    const val = (cellsData[key] || "").trim();
    if (val !== "") {
      filledCells.push({ row: r, col: c, key });
    }
  }

  // We'll parse out "blocks"
  const containers = getContainersJS(filledCells, 2, rowCount, colCount);
  const blockList = containers.map(finalizeBlock);

  // build locked/linked
  const blockJoins = populateBlockJoins(blockList);
  const blockClusters = populateBlockClusters(blockList, blockJoins);

  // run Patterns
  PatternsManager.parseAll(filledCells, blockList);

  // build final style map
  const styleMap = applyBlockStyles(blockList, blockClusters);

  // store in global so CellView can read it
  (window as any).styleMap = styleMap;
}

/** A BFS approach to group close filled cells. */
function getContainersJS(
  filledPoints: { row: number; col: number; key?: string }[],
  outlineMargin: number,
  rowCount: number,
  colCount: number
): Container[] {
  const used = new Set<string>();
  const containers: Container[] = [];

  for (const fp of filledPoints) {
    const ptKey = `${fp.row},${fp.col}`;
    if (used.has(ptKey)) continue;

    const queue = [fp];
    used.add(ptKey);

    let minR = fp.row;
    let maxR = fp.row;
    let minC = fp.col;
    let maxC = fp.col;

    const allPoints = [fp];

    while (queue.length) {
      const current = queue.shift()!;
      for (const other of filledPoints) {
        const distR = Math.abs(other.row - current.row);
        const distC = Math.abs(other.col - current.col);
        if (distR <= outlineMargin && distC <= outlineMargin) {
          const otherKey = `${other.row},${other.col}`;
          if (!used.has(otherKey)) {
            used.add(otherKey);
            queue.push(other);
            allPoints.push(other);
            if (other.row < minR) minR = other.row;
            if (other.row > maxR) maxR = other.row;
            if (other.col < minC) minC = other.col;
            if (other.col > maxC) maxC = other.col;
          }
        }
      }
    }

    containers.push({
      topRow: minR,
      leftColumn: minC,
      bottomRow: maxR,
      rightColumn: maxC,
      filledPoints: allPoints.map((p) => ({ row: p.row, col: p.col })),
    });
  }

  return containers;
}

function finalizeBlock(cont: Container): Block {
  const block: Block = {
    topRow: cont.topRow,
    bottomRow: cont.bottomRow,
    leftCol: cont.leftColumn,
    rightCol: cont.rightColumn,
    canvasCells: [],
    borderCells: [],
    frameCells: [],
    cellClusters: [],
  };

  // Mark canvas
  const filledSet = new Set<string>();
  for (const p of cont.filledPoints) {
    filledSet.add(`${p.row},${p.col}`);
  }
  for (let r = block.topRow; r <= block.bottomRow; r++) {
    for (let c = block.leftCol; c <= block.rightCol; c++) {
      if (filledSet.has(`${r},${c}`)) {
        block.canvasCells.push({ row: r, col: c });
      }
    }
  }

  // border => 1 cell ring
  const br1 = block.topRow - 1;
  const br2 = block.bottomRow + 1;
  const bc1 = block.leftCol - 1;
  const bc2 = block.rightCol + 1;

  for (let cc = bc1; cc <= bc2; cc++) {
    block.borderCells.push({ row: br1, col: cc });
    block.borderCells.push({ row: br2, col: cc });
  }
  for (let rr = br1; rr <= br2; rr++) {
    block.borderCells.push({ row: rr, col: bc1 });
    block.borderCells.push({ row: rr, col: bc2 });
  }
  block.borderCells = dedupe(block.borderCells).filter(
    (p) => p.row > 0 && p.col > 0
  );

  // frame => 2 cell ring
  const fr1 = br1 - 1;
  const fr2 = br2 + 1;
  const fc1 = bc1 - 1;
  const fc2 = bc2 + 1;
  for (let cc = fc1; cc <= fc2; cc++) {
    block.frameCells.push({ row: fr1, col: cc });
    block.frameCells.push({ row: fr2, col: cc });
  }
  for (let rr = fr1; rr <= fr2; rr++) {
    block.frameCells.push({ row: rr, col: fc1 });
    block.frameCells.push({ row: rr, col: fc2 });
  }
  block.frameCells = dedupe(block.frameCells).filter(
    (p) => p.row > 0 && p.col > 0
  );

  // single cluster
  block.cellClusters.push(block.canvasCells);

  return block;
}

function populateBlockJoins(blockList: Block[]): any[] {
  const joins: any[] = [];
  for (let i = 0; i < blockList.length; i++) {
    for (let j = i + 1; j < blockList.length; j++) {
      let link = false;
      let lock = false;
      const b1 = blockList[i];
      const b2 = blockList[j];
      // link => frames overlap
      if (overlaps(b1.frameCells, b2.frameCells)) {
        link = true;
      }
      // lock => border vs frame overlap
      if (overlaps(b1.borderCells, b2.frameCells)) {
        lock = true;
      }

      if (link) {
        joins.push({ b1: i, b2: j, link, lock });
      }
    }
  }
  return joins;
}

function populateBlockClusters(blockList: Block[], blockJoins: any[]) {
  const visited = new Set<number>();
  const clusters: any[] = [];

  function bfs(start: number) {
    const queue = [start];
    const cluster = [start];
    visited.add(start);

    while (queue.length) {
      const cur = queue.shift()!;
      for (const jn of blockJoins) {
        if (jn.b1 === cur && !visited.has(jn.b2)) {
          visited.add(jn.b2);
          cluster.push(jn.b2);
          queue.push(jn.b2);
        } else if (jn.b2 === cur && !visited.has(jn.b1)) {
          visited.add(jn.b1);
          cluster.push(jn.b1);
          queue.push(jn.b1);
        }
      }
    }
    return cluster;
  }

  for (let i = 0; i < blockList.length; i++) {
    if (!visited.has(i)) {
      const c = bfs(i);
      clusters.push(c);
    }
  }
  return clusters;
}

/**
 * For each block's canvas/border/frame, build up a styleMap of classes
 */
function applyBlockStyles(blockList: Block[], blockClusters: any[]): Record<string, string[]> {
  // The final dictionary: "R{row}C{col}" => [ "canvas-cell", ... ]
  const styleMap: Record<string, string[]> = {};

  function addClass(r: number, c: number, className: string) {
    const key = `R${r}C${c}`;
    if (!styleMap[key]) styleMap[key] = [];
    if (!styleMap[key].includes(className)) {
      styleMap[key].push(className);
    }
  }

  // Mark border, frame, canvas
  blockList.forEach((blk) => {
    blk.canvasCells.forEach((p) => addClass(p.row, p.col, "canvas-cell"));
    blk.borderCells.forEach((p) => addClass(p.row, p.col, "border-cell"));
    blk.frameCells.forEach((p) => addClass(p.row, p.col, "frame-cell"));
  });

  // If a cell is used by two frames => linked
  const frameUsage: Record<string, number> = {};
  blockList.forEach((blk) => {
    blk.frameCells.forEach((p) => {
      const key = `R${p.row}C${p.col}`;
      frameUsage[key] = (frameUsage[key] || 0) + 1;
    });
  });
  for (const key in frameUsage) {
    if (frameUsage[key] > 1) {
      // multiple frames => linked
      const classes = styleMap[key] || [];
      // remove "frame-cell" if present
      const idx = classes.indexOf("frame-cell");
      if (idx !== -1) classes.splice(idx, 1);
      // add "linked-cell"
      if (!classes.includes("linked-cell")) {
        classes.push("linked-cell");
      }
      styleMap[key] = classes;
    }
  }

  return styleMap;
}

// helper
