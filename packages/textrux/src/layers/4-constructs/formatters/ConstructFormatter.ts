import { CellFormat } from "../../../style/CellFormat";
import { TreeFormatter, TreeFormattingOptions } from "./TreeFormatter";
import { CoreTree, TreeElement } from "../cell-cluster/CoreTree";
import { CoreTable, TableCell } from "../cell-cluster/CoreTable";
import { CoreMatrix, MatrixCell } from "../cell-cluster/CoreMatrix";
import { BaseConstruct } from "../interfaces/ConstructInterfaces";

export interface ConstructFormattingOptions {
  theme: "default" | "modern" | "minimal" | "bold";
  darkMode?: boolean;
  enableFormatting?: boolean;
}

export class ConstructFormatter {
  private options: ConstructFormattingOptions;
  private treeFormatter: TreeFormatter;
  
  // Performance optimization: cache for construct lookups
  private constructLookupCache: Map<string, BaseConstruct[]> = new Map();
  private lastConstructsUpdate: number = 0;

  constructor(options: ConstructFormattingOptions) {
    this.options = options;
    this.treeFormatter = new TreeFormatter({
      theme: options.theme,
      orientation: "regular", // Default, will be updated per tree
      darkMode: options.darkMode,
    });
  }

  /**
   * Get formatting for any construct element at a specific position
   * Optimized with bounds pre-filtering and construct caching
   */
  getFormatForPosition(
    row: number,
    col: number,
    constructs: BaseConstruct[]
  ): CellFormat | null {
    if (!this.options.enableFormatting || !constructs.length) {
      return null;
    }

    // Performance optimization: Use cached construct lookup if available
    const cacheKey = `${row},${col}`;
    const currentTime = Date.now();
    
    // Check if we have relevant constructs cached for this position
    let relevantConstructs = this.constructLookupCache.get(cacheKey);
    
    // Only rebuild cache if constructs have changed or cache is stale (> 1 second)
    if (!relevantConstructs || currentTime - this.lastConstructsUpdate > 1000) {
      relevantConstructs = this.getConstructsAtPosition(row, col, constructs);
      this.constructLookupCache.set(cacheKey, relevantConstructs);
      
      // Clean up old cache entries periodically
      if (this.constructLookupCache.size > 1000) {
        this.cleanupCache();
      }
    }

    // Quick exit if no constructs at this position
    if (!relevantConstructs.length) {
      return null;
    }

    // Process only relevant constructs (much faster than checking all)
    for (const construct of relevantConstructs) {
      const format = this.getConstructFormat(construct, row, col);
      if (format) {
        return format;
      }
    }

    return null;
  }

  /**
   * Get constructs that contain a specific position (bounds checking only)
   */
  private getConstructsAtPosition(
    row: number,
    col: number,
    constructs: BaseConstruct[]
  ): BaseConstruct[] {
    const relevant: BaseConstruct[] = [];
    
    for (const construct of constructs) {
      // Optimized bounds check - early exit conditions
      if (
        row >= construct.bounds.topRow &&
        row <= construct.bounds.bottomRow &&
        col >= construct.bounds.leftCol &&
        col <= construct.bounds.rightCol
      ) {
        relevant.push(construct);
      }
    }
    
    return relevant;
  }

  /**
   * Clean up old cache entries to prevent memory leaks
   */
  private cleanupCache(): void {
    // Keep only the most recent 500 entries
    const entries = Array.from(this.constructLookupCache.entries());
    this.constructLookupCache.clear();
    
    // Keep the last 500 entries
    const keepEntries = entries.slice(-500);
    for (const [key, value] of keepEntries) {
      this.constructLookupCache.set(key, value);
    }
  }

  /**
   * Get formatting for a specific construct at a position
   */
  private getConstructFormat(
    construct: BaseConstruct,
    row: number,
    col: number
  ): CellFormat | null {
    switch (construct.type) {
      case "tree":
        return this.getTreeFormat(construct as CoreTree, row, col);
      case "table":
        return this.getTableFormat(construct as CoreTable, row, col);
      case "matrix":
        return this.getMatrixFormat(construct as CoreMatrix, row, col);
      default:
        return null;
    }
  }

  /**
   * Get formatting for tree construct
   */
  private getTreeFormat(
    tree: CoreTree,
    row: number,
    col: number
  ): CellFormat | null {
    // Find the tree element at this position first (fastest check)
    const element = tree.findElementAt(row, col);
    if (!element) {
      return null;
    }

    // Update tree formatter orientation only when needed
    this.treeFormatter = this.treeFormatter.withOptions({
      orientation: tree.orientation,
    });

    return this.treeFormatter.getElementFormat(element);
  }

  /**
   * Get formatting for table construct
   */
  private getTableFormat(
    table: CoreTable,
    row: number,
    col: number
  ): CellFormat | null {
    const cell = table.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    if (cell.cellType === "header") {
      return new CellFormat({
        fontWeight: "bold",
        backgroundColor: this.getTableHeaderColor(theme, isDark),
        color: isDark ? "#ffffff" : "#000000",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: isDark ? "#666666" : "#cccccc",
      });
    } else {
      return new CellFormat({
        backgroundColor: this.getTableBodyColor(theme, isDark),
        color: isDark ? "#ffffff" : "#000000",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: isDark ? "#555555" : "#dddddd",
      });
    }
  }

  /**
   * Get formatting for matrix construct
   */
  private getMatrixFormat(
    matrix: CoreMatrix,
    row: number,
    col: number
  ): CellFormat | null {
    const cell = matrix.getCellAt(row, col);
    if (!cell) {
      return null;
    }

    const isDark = this.options.darkMode ?? false;
    const { theme } = this.options;

    switch (cell.cellType) {
      case "primary-header":
        return new CellFormat({
          fontWeight: "bold",
          backgroundColor: this.getMatrixPrimaryHeaderColor(theme, isDark),
          color: isDark ? "#ffffff" : "#000000",
          borderStyle: "solid",
          borderWidth: "2px 1px 1px 2px",
          borderColor: isDark ? "#777777" : "#999999",
        });
      case "secondary-header":
        return new CellFormat({
          fontWeight: "bold",
          backgroundColor: this.getMatrixSecondaryHeaderColor(theme, isDark),
          color: isDark ? "#ffffff" : "#000000",
          borderStyle: "solid",
          borderWidth: "1px 2px 2px 1px",
          borderColor: isDark ? "#777777" : "#999999",
        });
      case "body":
        return new CellFormat({
          backgroundColor: this.getMatrixBodyColor(theme, isDark),
          color: isDark ? "#ffffff" : "#000000",
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: isDark ? "#555555" : "#dddddd",
        });
      default:
        return null;
    }
  }

  /**
   * Theme-specific color methods
   */
  private getTableHeaderColor(theme: string, isDark: boolean): string {
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

  private getTableBodyColor(theme: string, isDark: boolean): string {
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

  private getMatrixPrimaryHeaderColor(theme: string, isDark: boolean): string {
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

  private getMatrixSecondaryHeaderColor(
    theme: string,
    isDark: boolean
  ): string {
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

  private getMatrixBodyColor(theme: string, isDark: boolean): string {
    return this.getTableBodyColor(theme, isDark); // Same as table body
  }

  /**
   * Update formatting options and invalidate caches
   */
  updateOptions(options: Partial<ConstructFormattingOptions>): void {
    this.options = { ...this.options, ...options };
    this.treeFormatter = this.treeFormatter.withOptions({
      theme: this.options.theme,
      darkMode: this.options.darkMode,
    });
    
    // Clear cache when formatting options change
    this.invalidateCache();
  }

  /**
   * Invalidate all caches (call when constructs or options change)
   */
  invalidateCache(): void {
    this.constructLookupCache.clear();
    this.lastConstructsUpdate = Date.now();
  }

  /**
   * Notify formatter that constructs have been updated
   */
  onConstructsUpdated(): void {
    this.invalidateCache();
  }

  /**
   * Check if formatting is enabled
   */
  isFormattingEnabled(): boolean {
    return this.options.enableFormatting ?? true;
  }

  /**
   * Get current formatting options
   */
  getOptions(): ConstructFormattingOptions {
    return { ...this.options };
  }
}
