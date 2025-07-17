import { CellFormat, CELL_THEMES } from "../../../style/CellFormat";
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

    // Get theme and detect orientation
    const theme = CELL_THEMES[this.options.theme] || CELL_THEMES.default;
    const orientation = this.detectOrientation(keyValue);

    switch (cell.cellType) {
      case "key":
        return CellFormat.constructs.keyValueKey(orientation, theme);
      case "value":
        return CellFormat.constructs.keyValueValue(theme);
      case "main-header":
        return this.getHeaderFormat(theme);
      default:
        return null;
    }
  }

  /**
   * Detect key-value orientation based on structure
   */
  private detectOrientation(keyValue: CoreKeyValue): 'regular' | 'transposed' {
    // For now, assume regular orientation
    return 'regular';
  }

  /**
   * Get formatting for header cells (section titles)
   */
  private getHeaderFormat(theme: any): CellFormat {
    return new CellFormat({
      fontWeight: "bold",
      backgroundColor: theme.colors?.background || '#ffffff',
      color: theme.colors?.text || '#1a1a1a',
      borderStyle: "solid",
      borderWidth: "2px 1px 1px 1px", // Thicker top border for section separation
      borderColor: theme.colors?.border || '#e1e5e9',
      textAlign: "center",
      fontSize: "15px",
      fontStyle: "italic",
      fontFamily: theme.typography?.fontFamily,
      padding: theme.spacing?.padding,
      transition: theme.effects?.transition,
    });
  }

  /**
   * Get current options
   */
  getOptions(): KeyValueFormattingOptions {
    return { ...this.options };
  }
}