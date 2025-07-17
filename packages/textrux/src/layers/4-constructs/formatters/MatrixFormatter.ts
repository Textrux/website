import { CellFormat } from "../../../style/CellFormat";
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
  getCellFormat(matrix: CoreMatrix, row: number, col: number): CellFormat | null {
    const cell = matrix.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    switch (cell.cellType) {
      case "primary-header":
        return this.getPrimaryHeaderFormat();
      case "secondary-header":
        return this.getSecondaryHeaderFormat();
      case "body":
        return this.getBodyFormat();
      default:
        return null;
    }
  }

  /**
   * Get formatting for primary header cells (row labels)
   */
  private getPrimaryHeaderFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getPrimaryHeaderBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "2px 1px 1px 2px", // Thicker left and top borders
      borderColor: this.getPrimaryHeaderBorderColor(theme, isDark),
      textAlign: "right",
      fontSize: "14px",
      fontStyle: "italic",
    });
  }

  /**
   * Get formatting for secondary header cells (column labels)
   */
  private getSecondaryHeaderFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getSecondaryHeaderBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "1px 2px 2px 1px", // Thicker right and bottom borders
      borderColor: this.getSecondaryHeaderBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "14px",
      fontStyle: "italic",
    });
  }

  /**
   * Get formatting for matrix body cells (intersection data)
   */
  private getBodyFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "normal",
      backgroundColor: this.getBodyBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: this.getBodyBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "14px",
    });
  }

  /**
   * Get formatting for empty corner cell (top-left matrix cell)
   */
  private getEmptyCornerFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "normal",
      backgroundColor: this.getEmptyCornerBackgroundColor(theme, isDark),
      color: isDark ? "#888888" : "#666666",
      borderStyle: "solid",
      borderWidth: "2px 1px 1px 2px", // Thicker left and top borders like primary header
      borderColor: this.getEmptyCornerBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "12px",
      fontStyle: "italic",
    });
  }

  /**
   * Theme-specific primary header background colors
   */
  private getPrimaryHeaderBackgroundColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#2e7d32" : "#e8f5e8";
      case "minimal":
        return isDark ? "#404040" : "#f8f9fa";
      case "bold":
        return isDark ? "#f57c00" : "#fff3e0";
      default:
        return isDark ? "#444444" : "#f8f8f8";
    }
  }

  /**
   * Theme-specific secondary header background colors
   */
  private getSecondaryHeaderBackgroundColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#7b1fa2" : "#f3e5f5";
      case "minimal":
        return isDark ? "#505050" : "#f0f0f0";
      case "bold":
        return isDark ? "#5d4037" : "#efebe9";
      default:
        return isDark ? "#555555" : "#f0f0f0";
    }
  }

  /**
   * Theme-specific body background colors
   */
  private getBodyBackgroundColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#424242" : "#fafafa";
      case "minimal":
        return isDark ? "#2d2d2d" : "#ffffff";
      case "bold":
        return isDark ? "#616161" : "#f5f5f5";
      default:
        return isDark ? "#3a3a3a" : "#fdfdfd";
    }
  }

  /**
   * Theme-specific primary header border colors
   */
  private getPrimaryHeaderBorderColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#1b5e20" : "#c8e6c9";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#e65100" : "#ffcc02";
      default:
        return isDark ? "#777777" : "#999999";
    }
  }

  /**
   * Theme-specific secondary header border colors
   */
  private getSecondaryHeaderBorderColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#4a148c" : "#e1bee7";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#3e2723" : "#d7ccc8";
      default:
        return isDark ? "#777777" : "#999999";
    }
  }

  /**
   * Theme-specific body border colors
   */
  private getBodyBorderColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#555555" : "#e0e0e0";
      case "minimal":
        return isDark ? "#444444" : "#eeeeee";
      case "bold":
        return isDark ? "#757575" : "#e8e8e8";
      default:
        return isDark ? "#555555" : "#dddddd";
    }
  }

  /**
   * Theme-specific empty corner background colors
   */
  private getEmptyCornerBackgroundColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#1a1a1a" : "#fafafa";
      case "minimal":
        return isDark ? "#2a2a2a" : "#f8f9fa";
      case "bold":
        return isDark ? "#424242" : "#f5f5f5";
      default:
        return isDark ? "#2d2d2d" : "#f0f0f0";
    }
  }

  /**
   * Theme-specific empty corner border colors
   */
  private getEmptyCornerBorderColor(theme: MatrixTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#666666" : "#cccccc";
      case "minimal":
        return isDark ? "#555555" : "#dddddd";
      case "bold":
        return isDark ? "#777777" : "#bbbbbb";
      default:
        return isDark ? "#666666" : "#cccccc";
    }
  }

  /**
   * Get current options
   */
  getOptions(): MatrixFormattingOptions {
    return { ...this.options };
  }
}