import { CellFormat, CELL_THEMES } from "../../../style/CellFormat";
import { CoreList, ListCell } from "../cell-cluster/CoreList";

export type ListTheme = "default" | "modern" | "minimal" | "bold";

export interface ListFormattingOptions {
  theme: ListTheme;
  darkMode?: boolean;
}

/**
 * Dedicated formatter for list constructs
 * Lists represent sequential items with optional headers/titles
 */
export class ListFormatter {
  private options: ListFormattingOptions;

  constructor(options: ListFormattingOptions) {
    this.options = options;
  }

  /**
   * Create a new formatter with updated options
   */
  withOptions(updates: Partial<ListFormattingOptions>): ListFormatter {
    return new ListFormatter({ ...this.options, ...updates });
  }

  /**
   * Get formatting for a list cell based on its type and orientation
   */
  getCellFormat(list: CoreList, row: number, col: number): CellFormat | null {
    const cell = list.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    const theme = CELL_THEMES[this.options.theme] || CELL_THEMES.default;

    switch (cell.cellType) {
      case "header":
        if (list.orientation === "regular") {
          // Vertical list header
          return CellFormat.constructs.listVerticalHeader(theme);
        } else {
          // Horizontal list header  
          return CellFormat.constructs.listHorizontalHeader(theme);
        }
      case "item":
        return CellFormat.constructs.listItem(theme);
      default:
        return null;
    }
  }

  /**
   * Get current options
   */
  getOptions(): ListFormattingOptions {
    return { ...this.options };
  }
}