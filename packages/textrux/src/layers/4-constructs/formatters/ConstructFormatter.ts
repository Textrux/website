import { CellFormat } from "../../../style/CellFormat";
import { TreeFormatter } from "./TreeFormatter";
import { TableFormatter } from "./TableFormatter";
import { MatrixFormatter } from "./MatrixFormatter";
import { KeyValueFormatter } from "./KeyValueFormatter";
import { ListFormatter } from "./ListFormatter";
import { CoreTree } from "../cell-cluster/CoreTree";
import { CoreTable } from "../cell-cluster/CoreTable";
import { CoreMatrix } from "../cell-cluster/CoreMatrix";
import { CoreKeyValue } from "../cell-cluster/CoreKeyValue";
import { CoreList } from "../cell-cluster/CoreList";
import { BaseConstruct } from "../interfaces/ConstructInterfaces";

export interface ConstructFormattingOptions {
  theme: "default" | "modern" | "minimal" | "bold";
  darkMode?: boolean;
  enableFormatting?: boolean;
}

export class ConstructFormatter {
  private options: ConstructFormattingOptions;
  private treeFormatter: TreeFormatter;
  private tableFormatter: TableFormatter;
  private matrixFormatter: MatrixFormatter;
  private keyValueFormatter: KeyValueFormatter;
  private listFormatter: ListFormatter;
  
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
    this.tableFormatter = new TableFormatter({
      theme: options.theme,
      darkMode: options.darkMode,
    });
    this.matrixFormatter = new MatrixFormatter({
      theme: options.theme,
      darkMode: options.darkMode,
    });
    this.keyValueFormatter = new KeyValueFormatter({
      theme: options.theme,
      darkMode: options.darkMode,
    });
    this.listFormatter = new ListFormatter({
      theme: options.theme,
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
      case "key-value":
        return this.getKeyValueFormat(construct as CoreKeyValue, row, col);
      case "list":
        return this.getListFormat(construct as CoreList, row, col);
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
    return this.tableFormatter.getCellFormat(table, row, col);
  }

  /**
   * Get formatting for matrix construct
   */
  private getMatrixFormat(
    matrix: CoreMatrix,
    row: number,
    col: number
  ): CellFormat | null {
    return this.matrixFormatter.getCellFormat(matrix, row, col);
  }

  /**
   * Get formatting for key-value construct
   */
  private getKeyValueFormat(
    keyValue: CoreKeyValue,
    row: number,
    col: number
  ): CellFormat | null {
    return this.keyValueFormatter.getCellFormat(keyValue, row, col);
  }

  /**
   * Get formatting for list construct
   */
  private getListFormat(
    list: CoreList,
    row: number,
    col: number
  ): CellFormat | null {
    return this.listFormatter.getCellFormat(list, row, col);
  }

  /**
   * Update formatting options and invalidate caches
   */
  updateOptions(options: Partial<ConstructFormattingOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update all formatters with new options
    this.treeFormatter = this.treeFormatter.withOptions({
      theme: this.options.theme,
      darkMode: this.options.darkMode,
    });
    this.tableFormatter = this.tableFormatter.withOptions({
      theme: this.options.theme,
      darkMode: this.options.darkMode,
    });
    this.matrixFormatter = this.matrixFormatter.withOptions({
      theme: this.options.theme,
      darkMode: this.options.darkMode,
    });
    this.keyValueFormatter = this.keyValueFormatter.withOptions({
      theme: this.options.theme,
      darkMode: this.options.darkMode,
    });
    this.listFormatter = this.listFormatter.withOptions({
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
