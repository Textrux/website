import { CellFormat } from "../../../style/CellFormat";
import { CoreTable, TableCell, TableCellType } from "../cell-cluster/CoreTable";

export type TableTheme = "default" | "modern" | "minimal" | "bold";

export interface TableFormattingOptions {
  theme: TableTheme;
  darkMode?: boolean;
}

/**
 * Dedicated formatter for table constructs
 * Tables represent structured data with column headers and row data
 */
export class TableFormatter {
  private options: TableFormattingOptions;

  constructor(options: TableFormattingOptions) {
    this.options = options;
  }

  /**
   * Create a new formatter with updated options
   */
  withOptions(updates: Partial<TableFormattingOptions>): TableFormatter {
    return new TableFormatter({ ...this.options, ...updates });
  }

  /**
   * Get formatting for a table cell based on its type
   */
  getCellFormat(table: CoreTable, row: number, col: number): CellFormat | null {
    const cell = table.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    if (cell.cellType === "header") {
      return this.getHeaderFormat();
    } else {
      return this.getBodyFormat();
    }
  }

  /**
   * Get formatting for table header cells (column labels)
   */
  private getHeaderFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getHeaderBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: this.getHeaderBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "14px",
    });
  }

  /**
   * Get formatting for table body cells (data cells)
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
      textAlign: "left",
      fontSize: "14px",
    });
  }

  /**
   * Theme-specific header background colors
   */
  private getHeaderBackgroundColor(theme: TableTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#1976d2" : "#e3f2fd";
      case "minimal":
        return isDark ? "#404040" : "#f8f9fa";
      case "bold":
        return isDark ? "#d32f2f" : "#ffebee";
      default:
        return isDark ? "#333333" : "#f0f0f0";
    }
  }

  /**
   * Theme-specific body background colors
   */
  private getBodyBackgroundColor(theme: TableTheme, isDark: boolean): string {
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
   * Theme-specific header border colors
   */
  private getHeaderBorderColor(theme: TableTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#1565c0" : "#bbdefb";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#c62828" : "#ef9a9a";
      default:
        return isDark ? "#666666" : "#cccccc";
    }
  }

  /**
   * Theme-specific body border colors
   */
  private getBodyBorderColor(theme: TableTheme, isDark: boolean): string {
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
   * Infer cell type for empty cells within table bounds
   */
  private inferCellType(table: CoreTable, row: number, col: number): TableCellType {
    // Check if this position should be a header based on table structure
    const tableTopRow = table.bounds.topRow + 1; // Convert to 1-indexed
    const tableLeftCol = table.bounds.leftCol + 1; // Convert to 1-indexed
    
    // For tables, only the first row contains headers
    if (row === tableTopRow) {
      return "header";
    } else {
      return "body";
    }
  }

  /**
   * Get current options
   */
  getOptions(): TableFormattingOptions {
    return { ...this.options };
  }
}