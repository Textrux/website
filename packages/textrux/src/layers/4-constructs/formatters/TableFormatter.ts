import { CellFormat, CELL_THEMES } from "../../../style/CellFormat";
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

    // Get theme and detect orientation
    const theme = CELL_THEMES[this.options.theme] || CELL_THEMES.default;
    const orientation = this.detectOrientation(table);

    if (cell.cellType === "header") {
      return CellFormat.constructs.tableHeader(orientation, theme);
    } else {
      return CellFormat.constructs.tableBody(theme);
    }
  }

  /**
   * Detect table orientation based on structure
   */
  private detectOrientation(table: CoreTable): 'regular' | 'transposed' {
    // For now, assume regular orientation
    return 'regular';
  }

  /**
   * Infer cell type for empty cells within table bounds
   */
  private inferCellType(
    table: CoreTable,
    row: number,
    col: number
  ): TableCellType {
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
