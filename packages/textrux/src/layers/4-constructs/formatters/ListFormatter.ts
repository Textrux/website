import { CellFormat } from "../../../style/CellFormat";
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

    switch (cell.cellType) {
      case "header":
        return this.getHeaderFormat(list.orientation);
      case "item":
        return this.getItemFormat(list.orientation);
      default:
        return null;
    }
  }

  /**
   * Get formatting for list header cells (list titles)
   */
  private getHeaderFormat(orientation: "regular" | "transposed"): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getHeaderBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: this.getHeaderBorderWidth(orientation),
      borderColor: this.getHeaderBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "15px",
      fontStyle: "italic",
    });
  }

  /**
   * Get formatting for list item cells (list content)
   */
  private getItemFormat(orientation: "regular" | "transposed"): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "normal",
      backgroundColor: this.getItemBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: this.getItemBorderWidth(orientation),
      borderColor: this.getItemBorderColor(theme, isDark),
      textAlign: "left",
      fontSize: "14px",
    });
  }

  /**
   * Get border width based on list orientation
   */
  private getHeaderBorderWidth(orientation: "regular" | "transposed"): string {
    // Emphasize the direction of list growth
    return orientation === "regular" 
      ? "2px 1px 1px 1px" // Thicker top border for vertical lists
      : "1px 1px 1px 2px"; // Thicker left border for horizontal lists
  }

  /**
   * Get border width for items based on list orientation
   */
  private getItemBorderWidth(orientation: "regular" | "transposed"): string {
    return "1px"; // Standard border for all items
  }

  /**
   * Theme-specific header background colors
   */
  private getHeaderBackgroundColor(theme: ListTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#455a64" : "#e0f2f1";
      case "minimal":
        return isDark ? "#404040" : "#f8f9fa";
      case "bold":
        return isDark ? "#8e24aa" : "#f3e5f5";
      default:
        return isDark ? "#444444" : "#f0f0f0";
    }
  }

  /**
   * Theme-specific item background colors
   */
  private getItemBackgroundColor(theme: ListTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#424242" : "#fafafa";
      case "minimal":
        return isDark ? "#2d2d2d" : "#ffffff";
      case "bold":
        return isDark ? "#616161" : "#f9f9f9";
      default:
        return isDark ? "#3a3a3a" : "#fdfdfd";
    }
  }

  /**
   * Theme-specific header border colors
   */
  private getHeaderBorderColor(theme: ListTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#37474f" : "#b0bec5";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#7b1fa2" : "#e1bee7";
      default:
        return isDark ? "#666666" : "#cccccc";
    }
  }

  /**
   * Theme-specific item border colors
   */
  private getItemBorderColor(theme: ListTheme, isDark: boolean): string {
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
   * Get current options
   */
  getOptions(): ListFormattingOptions {
    return { ...this.options };
  }
}