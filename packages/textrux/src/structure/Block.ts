import CellCluster from "./CellCluster";
import Container from "./Container";

/**
 * A Block is a structured object that includes:
 * - bounding rows/cols
 * - a set of “canvasPoints” (the actual data cells)
 * - borderPoints and framePoints
 */
export default class Block {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;

  /** The points that are the “filled” portion of the block. */
  canvasPoints: Array<{ row: number; col: number }>;

  /** The border ring around the bounding box. */
  borderPoints: Array<{ row: number; col: number }>;

  /** The second ring (frame) around the bounding box. */
  framePoints: Array<{ row: number; col: number }>;

  cellClusters: CellCluster[];

  constructor(container: Container) {
    this.topRow = container.topRow;
    this.bottomRow = container.bottomRow;
    this.leftCol = container.leftColumn;
    this.rightCol = container.rightColumn;

    this.canvasPoints = [];
    this.borderPoints = [];
    this.framePoints = [];
    this.cellClusters = [];
  }
}
