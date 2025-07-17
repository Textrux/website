import { CellFormat } from "../../../style/CellFormat";
import { CoreKeyValue, KeyValueCell } from "../cell-cluster/CoreKeyValue";

export type KeyValueTheme = "default" | "modern" | "minimal" | "bold";

export interface KeyValueFormattingOptions {
  theme: KeyValueTheme;
  darkMode?: boolean;
}

/**
 * Dedicated formatter for key-value constructs
 * Key-value pairs represent configuration, properties, and labeled data
 */
export class KeyValueFormatter {
  private options: KeyValueFormattingOptions;

  constructor(options: KeyValueFormattingOptions) {
    this.options = options;
  }

  /**
   * Create a new formatter with updated options
   */
  withOptions(updates: Partial<KeyValueFormattingOptions>): KeyValueFormatter {
    return new KeyValueFormatter({ ...this.options, ...updates });
  }

  /**
   * Get formatting for a key-value cell based on its type
   */
  getCellFormat(keyValue: CoreKeyValue, row: number, col: number): CellFormat | null {
    const cell = keyValue.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    switch (cell.cellType) {
      case "key":
        return this.getKeyFormat();
      case "value":
        return this.getValueFormat();
      case "main-header":
        return this.getHeaderFormat();
      default:
        return null;
    }
  }

  /**
   * Get formatting for key cells (labels/identifiers)
   */
  private getKeyFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getKeyBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "1px 2px 1px 1px", // Thicker right border to separate from values
      borderColor: this.getKeyBorderColor(theme, isDark),
      textAlign: "right",
      fontSize: "14px",
    });
  }

  /**
   * Get formatting for value cells (data/content)
   */
  private getValueFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "normal",
      backgroundColor: this.getValueBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: this.getValueBorderColor(theme, isDark),
      textAlign: "left",
      fontSize: "14px",
    });
  }

  /**
   * Get formatting for header cells (section titles)
   */
  private getHeaderFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: this.getHeaderBackgroundColor(theme, isDark),
      color: isDark ? "#ffffff" : "#000000",
      borderStyle: "solid",
      borderWidth: "2px 1px 1px 1px", // Thicker top border for section separation
      borderColor: this.getHeaderBorderColor(theme, isDark),
      textAlign: "center",
      fontSize: "15px",
      fontStyle: "italic",
    });
  }

  /**
   * Theme-specific key background colors
   */
  private getKeyBackgroundColor(theme: KeyValueTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#37474f" : "#eceff1";
      case "minimal":
        return isDark ? "#3a3a3a" : "#f8f9fa";
      case "bold":
        return isDark ? "#6a1b9a" : "#f3e5f5";
      default:
        return isDark ? "#444444" : "#f5f5f5";
    }
  }

  /**
   * Theme-specific value background colors
   */
  private getValueBackgroundColor(theme: KeyValueTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#424242" : "#ffffff";
      case "minimal":
        return isDark ? "#2d2d2d" : "#ffffff";
      case "bold":
        return isDark ? "#616161" : "#fafafa";
      default:
        return isDark ? "#3a3a3a" : "#ffffff";
    }
  }

  /**
   * Theme-specific header background colors
   */
  private getHeaderBackgroundColor(theme: KeyValueTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#1565c0" : "#e3f2fd";
      case "minimal":
        return isDark ? "#505050" : "#f8f9fa";
      case "bold":
        return isDark ? "#e53935" : "#ffebee";
      default:
        return isDark ? "#555555" : "#f0f0f0";
    }
  }

  /**
   * Theme-specific key border colors
   */
  private getKeyBorderColor(theme: KeyValueTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#263238" : "#cfd8dc";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#4a148c" : "#e1bee7";
      default:
        return isDark ? "#666666" : "#cccccc";
    }
  }

  /**
   * Theme-specific value border colors
   */
  private getValueBorderColor(theme: KeyValueTheme, isDark: boolean): string {
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
   * Theme-specific header border colors
   */
  private getHeaderBorderColor(theme: KeyValueTheme, isDark: boolean): string {
    switch (theme) {
      case "modern":
        return isDark ? "#0d47a1" : "#bbdefb";
      case "minimal":
        return isDark ? "#666666" : "#dee2e6";
      case "bold":
        return isDark ? "#c62828" : "#ef9a9a";
      default:
        return isDark ? "#777777" : "#999999";
    }
  }

  /**
   * Get current options
   */
  getOptions(): KeyValueFormattingOptions {
    return { ...this.options };
  }
}