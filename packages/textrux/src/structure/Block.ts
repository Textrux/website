import GridHelper from "../util/GridHelper";
import Container from "./Container";
import Cell from "./Cell";

export default class Block {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  canvasCells: Cell[];
  emptyCanvasCells: Cell[];
  emptyClusterCells: Cell[];
  cellClusters: Cell[][];
  borderCells: Cell[];
  frameCells: Cell[];

  constructor(container: Container) {
    this.topRow = container.topRow;
    this.bottomRow = container.bottomRow;
    this.leftCol = container.leftColumn;
    this.rightCol = container.rightColumn;
    this.canvasCells = container.filledPoints.map((p) => ({
      row: p.row,
      col: p.col,
    }));
    this.emptyCanvasCells = [];
    this.emptyClusterCells = [];
    this.cellClusters = [];
    this.borderCells = [];
    this.frameCells = [];
  }

  static finalizeBlock(cont: Container): Block {
    const block: Block = {
      topRow: cont.topRow,
      bottomRow: cont.bottomRow,
      leftCol: cont.leftColumn,
      rightCol: cont.rightColumn,
      canvasCells: [],
      borderCells: [],
      frameCells: [],
      cellClusters: [],
      emptyCanvasCells: [],
      emptyClusterCells: [],
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
    block.borderCells = GridHelper.dedupe(block.borderCells).filter(
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
    block.frameCells = GridHelper.dedupe(block.frameCells).filter(
      (p) => p.row > 0 && p.col > 0
    );

    // single cluster
    block.cellClusters.push(block.canvasCells);

    return block;
  }
}
