import { CellFormat } from "../../style/CellFormat";

export default class CellCluster {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;

  filledPoints: Array<{ row: number; col: number }>;

  /** Formatting for empty cells within the cluster */
  clusterEmptyFormat: CellFormat;

  constructor(
    topRow: number,
    bottomRow: number,
    leftCol: number,
    rightCol: number,
    filledPoints: Array<{ row: number; col: number }>
  ) {
    this.topRow = topRow;
    this.bottomRow = bottomRow;
    this.leftCol = leftCol;
    this.rightCol = rightCol;
    this.filledPoints = filledPoints;

    // Initialize with default format
    this.clusterEmptyFormat = CellFormat.fromCssClass("cluster-empty-cell");
  }

  /**
   * Set custom formatting for this cluster's empty cells
   */
  setCustomFormatting(clusterEmptyFormat?: CellFormat) {
    if (clusterEmptyFormat) this.clusterEmptyFormat = clusterEmptyFormat;
  }
}
