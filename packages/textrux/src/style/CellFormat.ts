/**
 * CellFormat defines all possible visual styling options for a cell.
 * This is used by structure classes to define consistent formatting
 * for different parts of structures.
 */
export class CellFormat {
  // Background properties
  backgroundColor?: string;
  backgroundOpacity?: number;

  // Text properties
  color?: string;
  fontWeight?: "normal" | "bold" | "lighter";
  fontSize?: string;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: string;

  // Border properties
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;

  // Cell-specific sizing (when "Size cells by" is set to "Cell")
  width?: number; // Last width this cell was set to
  height?: number; // Last height this cell was set to
  lastWidthSource?: "auto" | "manual"; // How the width was last set
  lastHeightSource?: "auto" | "manual"; // How the height was last set

  // Interaction
  cursor?: string;
  pointerEvents?: React.CSSProperties["pointerEvents"];

  // Additional
  opacity?: number;
  zIndex?: number;

  // Store the original CSS class if needed for backward compatibility
  cssClass?: string;

  constructor(options: Partial<CellFormat> = {}) {
    Object.assign(this, options);
  }

  /**
   * Create a CellFormat from a predefined CSS class name
   */
  static fromCssClass(className: string): CellFormat {
    const format = new CellFormat({ cssClass: className });

    // Define the mappings from CSS classes to CellFormat properties
    switch (className) {
      case "canvas-cell":
        format.backgroundColor = "white";
        format.color = "black";
        format.fontWeight = "bold";
        format.textAlign = "center";
        break;

      case "canvas-empty-cell":
        format.backgroundColor = "#eef"; // Light blue
        break;

      case "border-cell":
        format.backgroundColor = "lightyellow";
        break;

      case "frame-cell":
        format.backgroundColor = "yellow";
        break;

      case "cluster-empty-cell":
        format.backgroundColor = "#bbf"; // Slightly darker blue
        break;

      case "linked-cell":
        format.backgroundColor = "orange";
        format.color = "white";
        break;

      case "locked-cell":
        format.backgroundColor = "red";
        format.color = "white";
        break;

      case "disabled-cell":
        format.backgroundColor = "#eee";
        format.color = "#999";
        format.cursor = "not-allowed";
        break;

      default:
        // For unknown classes, just store the class name
        break;
    }

    return format;
  }

  /**
   * Convert a CellFormat to CSS classes
   */
  toCssClasses(): string[] {
    const classes: string[] = [];

    // If there's an explicitly set CSS class, include it
    if (this.cssClass) {
      classes.push(this.cssClass);
    }

    // In the future, this could generate dynamic CSS classes based on properties

    return classes;
  }

  /**
   * Convert a CellFormat to inline styles
   */
  toInlineStyles(): React.CSSProperties {
    const styles: React.CSSProperties = {};

    // Only add defined properties
    if (this.backgroundColor) styles.backgroundColor = this.backgroundColor;
    if (this.color) styles.color = this.color;
    if (this.fontWeight) styles.fontWeight = this.fontWeight;
    if (this.fontSize) styles.fontSize = this.fontSize;
    if (this.fontStyle) styles.fontStyle = this.fontStyle;
    if (this.textAlign) styles.textAlign = this.textAlign;
    if (this.textDecoration) styles.textDecoration = this.textDecoration;
    if (this.borderColor) styles.borderColor = this.borderColor;
    if (this.borderStyle) styles.borderStyle = this.borderStyle;
    if (this.borderWidth) styles.borderWidth = this.borderWidth;
    if (this.cursor) styles.cursor = this.cursor;
    if (this.pointerEvents) styles.pointerEvents = this.pointerEvents;
    if (this.opacity) styles.opacity = this.opacity;
    if (this.zIndex) styles.zIndex = this.zIndex;

    return styles;
  }

  /**
   * Create a cell format from a serialized string (for future use)
   */
  static fromString(formatStr: string): CellFormat {
    try {
      // This could parse a custom format string syntax in the future
      // For now, just try to parse as JSON
      return new CellFormat(JSON.parse(formatStr));
    } catch (e) {
      console.error("Failed to parse cell format string:", e);
      return new CellFormat();
    }
  }

  /**
   * Serialize to string (for future use in storing formats in the grid)
   */
  toString(): string {
    // In the future, this could use a custom syntax
    // For now, just use JSON
    return JSON.stringify(this);
  }

  /**
   * Create a new CellFormat by merging with another one
   */
  merge(other: CellFormat): CellFormat {
    return new CellFormat({
      ...this,
      ...other,
    });
  }
}
