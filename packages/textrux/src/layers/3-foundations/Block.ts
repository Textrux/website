import CellCluster from "./CellCluster";
import Container from "./Container";
import { CellFormat } from "../../style/CellFormat";

/**
 * A Block is a structured object that includes:
 * - bounding rows/cols
 * - a set of "canvasPoints" (the actual data cells)
 * - borderPoints and framePoints
 * - formatting for different types of cells
 */
export default class Block {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;

  /** The points that are the "filled" portion of the block. */
  canvasPoints: Array<{ row: number; col: number }>;

  /** The border ring around the bounding box. */
  borderPoints: Array<{ row: number; col: number }>;

  /** The second ring (frame) around the bounding box. */
  framePoints: Array<{ row: number; col: number }>;

  cellClusters: CellCluster[];

  /** Formatting for filled canvas cells */
  canvasFormat: CellFormat;

  /** Formatting for empty canvas cells */
  canvasEmptyFormat: CellFormat;

  /** Formatting for border cells */
  borderFormat: CellFormat;

  /** Formatting for frame cells */
  frameFormat: CellFormat;

  constructor(container: Container) {
    this.topRow = container.topRow;
    this.bottomRow = container.bottomRow;
    this.leftCol = container.leftColumn;
    this.rightCol = container.rightColumn;

    this.canvasPoints = [];
    this.borderPoints = [];
    this.framePoints = [];
    this.cellClusters = [];

    // Initialize with default formats
    this.canvasFormat = CellFormat.fromCssClass("canvas-cell");
    this.canvasEmptyFormat = CellFormat.fromCssClass("canvas-empty-cell");
    this.borderFormat = CellFormat.fromCssClass("border-cell");
    this.frameFormat = CellFormat.fromCssClass("frame-cell");
  }

  /**
   * Set custom formatting for this block's cells
   */
  setCustomFormatting(
    canvasFormat?: CellFormat,
    canvasEmptyFormat?: CellFormat,
    borderFormat?: CellFormat,
    frameFormat?: CellFormat
  ) {
    if (canvasFormat) this.canvasFormat = canvasFormat;
    if (canvasEmptyFormat) this.canvasEmptyFormat = canvasEmptyFormat;
    if (borderFormat) this.borderFormat = borderFormat;
    if (frameFormat) this.frameFormat = frameFormat;
  }
}
