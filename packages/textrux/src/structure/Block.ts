import Container from "./Container";
import Cell from "./Cell";

/**
 * A Block is basically a structured object that includes:
 * - bounding rows/cols
 * - a set of “canvasCells” (the actual data cells)
 * - borderCells and frameCells (one and two rings around the bounding box)
 * - any cell clusters within the canvas (often just one, but sometimes multiple).
 */
export default class Block {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;

  // The actual "filled" cells from the grid that lie inside this block's bounding box:
  canvasCells: Cell[];

  // Additional “empty” or “cluster” details:
  emptyCanvasCells: Cell[];
  emptyClusterCells: Cell[];
  cellClusters: Cell[][];

  // For the border/frame, we store row/col (no need for full Cell objects):
  borderCells: Array<{ row: number; col: number }>;
  frameCells: Array<{ row: number; col: number }>;

  constructor(container: Container) {
    this.topRow = container.topRow;
    this.bottomRow = container.bottomRow;
    this.leftCol = container.leftColumn;
    this.rightCol = container.rightColumn;

    // The container’s filled cells become our default “canvas” cells:
    this.canvasCells = [...container.filledCells];

    // Potentially used later if you want to find empties or subdivide:
    this.emptyCanvasCells = [];
    this.emptyClusterCells = [];
    this.cellClusters = [];

    this.borderCells = [];
    this.frameCells = [];
  }
}
