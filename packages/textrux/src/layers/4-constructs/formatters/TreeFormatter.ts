import { CellFormat } from "../../../style/CellFormat";
import { TreeElement, TreeOrientation } from "../cell-cluster/CoreTree";

export type TreeTheme = "default" | "modern" | "minimal" | "bold";

export interface TreeFormattingOptions {
  theme: TreeTheme;
  orientation: TreeOrientation;
  darkMode?: boolean;
}

export class TreeFormatter {
  private options: TreeFormattingOptions;

  constructor(options: TreeFormattingOptions) {
    this.options = options;
  }

  /**
   * Get formatting for a tree element based on its role
   */
  getElementFormat(element: TreeElement): CellFormat {
    const baseFormat = this.getBaseFormat();

    if (element.isAnchor()) {
      return this.getAnchorFormat(baseFormat);
    } else if (element.isParent()) {
      return this.getParentFormat(baseFormat);
    } else if (element.isChildHeader()) {
      return this.getChildHeaderFormat(baseFormat);
    } else if (element.isChild()) {
      return this.getChildFormat(baseFormat);
    } else {
      return baseFormat;
    }
  }

  /**
   * Get base formatting that applies to all tree elements
   */
  private getBaseFormat(): CellFormat {
    const isDark = this.options.darkMode ?? false;

    return new CellFormat({
      backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
      fontWeight: "normal",
      fontSize: "14px",
    });
  }

  /**
   * Get formatting for anchor (root) elements
   */
  private getAnchorFormat(base: CellFormat): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { orientation, theme } = this.options;

    const anchorFormat = new CellFormat({
      fontWeight: "bold",
      fontSize: "16px",
    });

    // Apply theme-specific colors
    switch (theme) {
      case "modern":
        anchorFormat.backgroundColor = isDark ? "#4a90e2" : "#e3f2fd";
        anchorFormat.color = isDark ? "#ffffff" : "#1976d2";
        break;
      case "minimal":
        anchorFormat.backgroundColor = isDark ? "#404040" : "#f8f9fa";
        anchorFormat.borderColor = isDark ? "#666666" : "#dee2e6";
        break;
      case "bold":
        anchorFormat.backgroundColor = isDark ? "#d32f2f" : "#ffebee";
        anchorFormat.color = isDark ? "#ffffff" : "#c62828";
        break;
      default:
        anchorFormat.backgroundColor = isDark ? "#333333" : "#f0f0f0";
        anchorFormat.color = isDark ? "#ffffff" : "#333333";
    }

    // Apply orientation-specific borders
    if (orientation === "regular") {
      anchorFormat.borderStyle = "solid";
      anchorFormat.borderWidth = "0 0 3px 0";
    } else {
      anchorFormat.borderStyle = "solid";
      anchorFormat.borderWidth = "0 3px 0 0";
    }

    return base.merge(anchorFormat);
  }

  /**
   * Get formatting for parent elements
   */
  private getParentFormat(base: CellFormat): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { orientation, theme } = this.options;

    const parentFormat = new CellFormat({
      fontWeight: "bold", // Semi-bold
    });

    // Apply theme-specific colors
    switch (theme) {
      case "modern":
        parentFormat.backgroundColor = isDark ? "#2e7d32" : "#e8f5e8";
        parentFormat.color = isDark ? "#ffffff" : "#2e7d32";
        break;
      case "minimal":
        parentFormat.borderColor = isDark ? "#555555" : "#adb5bd";
        break;
      case "bold":
        parentFormat.backgroundColor = isDark ? "#f57c00" : "#fff3e0";
        parentFormat.color = isDark ? "#ffffff" : "#f57c00";
        break;
      default:
        parentFormat.backgroundColor = isDark ? "#444444" : "#f8f8f8";
    }

    // Apply orientation-specific borders
    if (orientation === "regular") {
      parentFormat.borderStyle = "solid";
      parentFormat.borderWidth = "0 1px 1px 0";
      parentFormat.borderColor = isDark ? "#666666" : "#cccccc";
    } else {
      parentFormat.borderStyle = "solid";
      parentFormat.borderWidth = "0 0 1px 1px";
      parentFormat.borderColor = isDark ? "#666666" : "#cccccc";
    }

    return base.merge(parentFormat);
  }

  /**
   * Get formatting for child header elements
   */
  private getChildHeaderFormat(base: CellFormat): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { orientation, theme } = this.options;

    const childHeaderFormat = new CellFormat({
      fontStyle: "italic",
      fontWeight: "bold",
    });

    // Apply theme-specific colors
    switch (theme) {
      case "modern":
        childHeaderFormat.backgroundColor = isDark ? "#7b1fa2" : "#f3e5f5";
        childHeaderFormat.color = isDark ? "#ffffff" : "#7b1fa2";
        break;
      case "minimal":
        childHeaderFormat.textDecoration = "underline";
        childHeaderFormat.borderColor = isDark ? "#555555" : "#adb5bd";
        break;
      case "bold":
        childHeaderFormat.backgroundColor = isDark ? "#5d4037" : "#efebe9";
        childHeaderFormat.color = isDark ? "#ffffff" : "#5d4037";
        break;
      default:
        childHeaderFormat.backgroundColor = isDark ? "#555555" : "#f0f0f0";
    }

    // Apply orientation-specific borders
    if (orientation === "regular") {
      childHeaderFormat.borderStyle = "solid";
      childHeaderFormat.borderWidth = "0 0 2px 0";
      childHeaderFormat.borderColor = isDark ? "#888888" : "#999999";
    } else {
      childHeaderFormat.borderStyle = "solid";
      childHeaderFormat.borderWidth = "0 2px 0 0";
      childHeaderFormat.borderColor = isDark ? "#888888" : "#999999";
    }

    return base.merge(childHeaderFormat);
  }

  /**
   * Get formatting for child elements
   */
  private getChildFormat(base: CellFormat): CellFormat {
    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    const childFormat = new CellFormat({
      fontWeight: "normal",
    });

    // Apply theme-specific colors
    switch (theme) {
      case "modern":
        childFormat.backgroundColor = isDark ? "#424242" : "#fafafa";
        break;
      case "minimal":
        // Keep default background
        break;
      case "bold":
        childFormat.backgroundColor = isDark ? "#616161" : "#f5f5f5";
        break;
      default:
        childFormat.backgroundColor = isDark ? "#3a3a3a" : "#fdfdfd";
    }

    return base.merge(childFormat);
  }

  /**
   * Create a formatter with updated options
   */
  withOptions(options: Partial<TreeFormattingOptions>): TreeFormatter {
    return new TreeFormatter({
      ...this.options,
      ...options,
    });
  }

  /**
   * Get all available themes
   */
  static getAvailableThemes(): TreeTheme[] {
    return ["default", "modern", "minimal", "bold"];
  }
}
