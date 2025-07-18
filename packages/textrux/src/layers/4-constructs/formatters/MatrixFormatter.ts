import { CellFormat, CELL_THEMES } from "../../../style/CellFormat";
import { CoreMatrix, MatrixCell } from "../cell-cluster/CoreMatrix";

export type MatrixTheme = "default" | "modern" | "minimal" | "bold";

export interface MatrixFormattingOptions {
  theme: MatrixTheme;
  darkMode?: boolean;
}

/**
 * Dedicated formatter for matrix constructs
 * Matrices represent cross-tabulated data with row/column headers and intersection values
 */
export class MatrixFormatter {
  private options: MatrixFormattingOptions;

  constructor(options: MatrixFormattingOptions) {
    this.options = options;
  }

  /**
   * Create a new formatter with updated options
   */
  withOptions(updates: Partial<MatrixFormattingOptions>): MatrixFormatter {
    return new MatrixFormatter({ ...this.options, ...updates });
  }

  /**
   * Get formatting for a matrix cell based on its type
   */
  getCellFormat(
    matrix: CoreMatrix,
    row: number,
    col: number
  ): CellFormat | null {
    const cell = matrix.getCellAt(row, col);
    if (!cell) {
      // console.log(`[MatrixFormatter] No cell found at (${row},${col})`);
      return null;
    }

    // Get theme and detect orientation
    const theme = CELL_THEMES[this.options.theme] || CELL_THEMES.default;
    const orientation = this.detectOrientation(matrix);

    // console.log(`[MatrixFormatter] Formatting cell at (${row},${col}) with type: ${cell.cellType}`);

    switch (cell.cellType) {
      case "primary-header":
        return CellFormat.constructs.matrixPrimaryHeader(orientation, theme);
      case "secondary-header":
        return CellFormat.constructs.matrixSecondaryHeader(orientation, theme);
      case "body":
        return CellFormat.constructs.matrixBody(theme);
      case "empty-corner":
        return this.getEmptyCornerFormat(theme);
      default:
        // console.log(`[MatrixFormatter] Unknown cell type: ${cell.cellType}`);
        return null;
    }
  }

  /**
   * Detect matrix orientation based on structure
   */
  private detectOrientation(matrix: CoreMatrix): "regular" | "transposed" {
    // For now, assume regular orientation. In future, this could be enhanced
    // to detect based on matrix structure or metadata
    return "regular";
  }

  /**
   * Get formatting for empty corner cell (top-left matrix cell)
   */
  private getEmptyCornerFormat(theme: any): CellFormat {
    return new CellFormat({
      backgroundColor: "#f8f9fa",
      color: theme.colors?.muted || "#6b7280",
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: theme.colors?.border || "#e1e5e9",
      textAlign: "center",
      fontSize: "12px",
      fontStyle: "italic",
      fontFamily: theme.typography?.fontFamily,
      padding: theme.spacing?.padding,
      transition: theme.effects?.transition,
    });
  }

  /**
   * Get current options
   */
  getOptions(): MatrixFormattingOptions {
    return { ...this.options };
  }
}
