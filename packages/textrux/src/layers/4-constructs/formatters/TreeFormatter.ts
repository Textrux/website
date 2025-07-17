import { CellFormat, CELL_THEMES } from "../../../style/CellFormat";
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
    const theme = CELL_THEMES[this.options.theme] || CELL_THEMES.default;
    const orientation = this.options.orientation;

    if (element.isAnchor()) {
      return CellFormat.constructs.treeAnchor(orientation, theme);
    } else if (element.isParent()) {
      return CellFormat.constructs.treeParent(theme);
    } else if (element.isChildHeader()) {
      return CellFormat.constructs.treeChild(theme);
    } else if (element.isChild()) {
      return CellFormat.constructs.treeChild(theme);
    } else {
      return CellFormat.constructs.treeChild(theme);
    }
  }

  /**
   * Create a new formatter with updated options
   */
  withOptions(updates: Partial<TreeFormattingOptions>): TreeFormatter {
    return new TreeFormatter({ ...this.options, ...updates });
  }

  /**
   * Get current options
   */
  getOptions(): TreeFormattingOptions {
    return { ...this.options };
  }

  /**
   * Get all available themes
   */
  static getAvailableThemes(): TreeTheme[] {
    return ["default", "modern", "minimal", "bold"];
  }
}