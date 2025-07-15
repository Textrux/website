import GridModel from "../1-substrate/GridModel";
import CellCluster from "../3-foundation/cell-cluster/CellCluster";
import { CoreDetectionRules, DetectionResult } from "../3-foundation/cell-cluster/CoreDetectionRules";
import { CoreTree, TreeElement, TreeElementType } from "./cell-cluster/CoreTree";
import { CoreTable, TableCell } from "./cell-cluster/CoreTable";
import { CoreMatrix, MatrixCell } from "./cell-cluster/CoreMatrix";
import { CoreKeyValue, KeyValueCell } from "./cell-cluster/CoreKeyValue";
import { CoreList, ListCell } from "./cell-cluster/CoreList";
import { BaseConstruct } from "./interfaces/ConstructInterfaces";

/**
 * Core Construct Parser using Cell Cluster Key system
 * Replaces complex signature parsers with elegant key-based construction
 */
export class CoreConstructParser {
  private grid: GridModel;
  private detector: CoreDetectionRules;

  constructor(grid: GridModel) {
    this.grid = grid;
    this.detector = new CoreDetectionRules(grid);
  }

  /**
   * Parse a cell cluster and create the appropriate construct using key-based detection
   */
  parseConstruct(cluster: CellCluster): BaseConstruct | null {
    // Detect construct type using binary key system
    const detection = this.detector.detectConstruct(cluster);
    if (!detection) return null;

    // Create the appropriate construct based on detection
    switch (detection.constructType) {
      case "table":
        return this.createTable(cluster, detection);
      case "matrix":
        return this.createMatrix(cluster, detection);
      case "key-value":
        return this.createKeyValue(cluster, detection);
      case "tree":
        return this.createTree(cluster, detection);
      case "list":
        return this.createList(cluster, detection);
      default:
        return null;
    }
  }

  /**
   * Create a Core Table construct
   */
  private createTable(cluster: CellCluster, detection: DetectionResult): CoreTable {
    const tableId = `table_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const table = new CoreTable(
      tableId,
      `core-table-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      }
    );

    // Add all cells (tables have all cells filled by definition of key=15)
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          // Determine if this is a header cell (first row or first column)
          const isHeaderRow = row === cluster.topRow + 1;
          const isHeaderCol = col === cluster.leftCol + 1;
          const cellType = (isHeaderRow || isHeaderCol) ? "header" : "body";
          
          const cell = CoreTable.createCell(
            { row: row - 1, col: col - 1 }, // Convert to 0-indexed
            content.trim(),
            cellType
          );
          
          table.addCell(cell);
        }
      }
    }

    // Organize into entities and attributes
    table.organizeEntitiesAndAttributes();
    
    return table;
  }

  /**
   * Create a Core Matrix construct
   */
  private createMatrix(cluster: CellCluster, detection: DetectionResult): CoreMatrix {
    const matrixId = `matrix_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const matrix = new CoreMatrix(
      matrixId,
      `core-matrix-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      }
    );

    // Add all cells except the empty corner (R1C1) by definition of key=7
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        // Skip R1C1 (empty corner) - this is what makes it key=7
        if (row === cluster.topRow + 1 && col === cluster.leftCol + 1) {
          continue;
        }
        
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          // Determine cell type
          let cellType: "primary-header" | "secondary-header" | "body";
          
          if (row === cluster.topRow + 1) {
            cellType = "primary-header"; // First row headers
          } else if (col === cluster.leftCol + 1) {
            cellType = "secondary-header"; // First column headers
          } else {
            cellType = "body"; // Body cells
          }
          
          const cell = CoreMatrix.createCell(
            { row: row - 1, col: col - 1 }, // Convert to 0-indexed
            content.trim(),
            cellType
          );
          
          matrix.addCell(cell);
        }
      }
    }

    // Organize into entities
    matrix.organizeEntities();
    
    return matrix;
  }

  /**
   * Create a Core Key-Value construct
   */
  private createKeyValue(cluster: CellCluster, detection: DetectionResult): CoreKeyValue {
    const keyValueId = `keyvalue_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const keyValue = new CoreKeyValue(
      keyValueId,
      `core-keyvalue-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      },
      detection.orientation || "regular"
    );

    // Process cells based on key=9 pattern: R1C1 filled, R2C1+R1C2 empty, R2C2 filled (first key)
    if (detection.orientation === "regular") {
      // Vertical key-values: keys in first column, values in other columns
      this.processVerticalKeyValues(cluster, keyValue);
    } else {
      // Horizontal key-values: keys in first row, values in other rows
      this.processHorizontalKeyValues(cluster, keyValue);
    }

    // Organize into pairs
    keyValue.organizeKeyValuePairs();
    
    return keyValue;
  }

  /**
   * Process vertical (regular) key-value structure based on key=9 pattern
   */
  private processVerticalKeyValues(cluster: CellCluster, keyValue: CoreKeyValue): void {
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          let cellType: "main-header" | "key" | "value" | "marker";
          
          if (row === cluster.topRow + 1 && col === cluster.leftCol + 1) {
            cellType = "main-header"; // R1C1 is main header
          } else if (col === cluster.leftCol + 2) {
            cellType = "key"; // Second column contains keys (starting at R2C2)
          } else if (col > cluster.leftCol + 2) {
            cellType = "value"; // Columns beyond second contain values
          } else {
            // Skip gap cells (R2C1, R1C2) - these are empty by definition of key=9
            continue;
          }
          
          const cell = CoreKeyValue.createCell(
            { row: row - 1, col: col - 1 },
            content.trim(),
            cellType
          );
          
          keyValue.addCell(cell);
        }
      }
    }
  }

  /**
   * Process horizontal (transposed) key-value structure based on key=9 pattern
   */
  private processHorizontalKeyValues(cluster: CellCluster, keyValue: CoreKeyValue): void {
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          let cellType: "main-header" | "key" | "value" | "marker";
          
          if (row === cluster.topRow + 1 && col === cluster.leftCol + 1) {
            cellType = "main-header"; // R1C1 is main header
          } else if (row === cluster.topRow + 2) {
            cellType = "key"; // Second row contains keys (starting at R2C2)
          } else if (row > cluster.topRow + 2) {
            cellType = "value"; // Rows beyond second contain values
          } else {
            // Skip gap cells (R1C2, R2C1) - these are empty by definition of key=9
            continue;
          }
          
          const cell = CoreKeyValue.createCell(
            { row: row - 1, col: col - 1 },
            content.trim(),
            cellType
          );
          
          keyValue.addCell(cell);
        }
      }
    }
  }

  /**
   * Create a Core List construct
   */
  private createList(cluster: CellCluster, detection: DetectionResult): CoreList {
    const listId = `list_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const list = new CoreList(
      listId,
      `core-list-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      },
      detection.orientation || "regular"
    );

    // Process cells based on 2-cell key pattern
    if (detection.orientation === "regular") {
      // Vertical list: header at R1C1, items starting at R2C1
      this.processVerticalList(cluster, list);
    } else {
      // Horizontal list: header at R1C1, items starting at R1C2
      this.processHorizontalList(cluster, list);
    }

    // Organize items and calculate metrics
    list.organizeItems();
    
    return list;
  }

  /**
   * Process vertical (regular) list structure
   * Cluster is guaranteed to be single column with at least 2 cells
   */
  private processVerticalList(cluster: CellCluster, list: CoreList): void {
    const col = cluster.leftCol + 1; // Single column for vertical lists
    
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      const content = this.grid.getCellRaw(row, col);
      
      if (content && content.trim()) {
        let cellType: "header" | "item";
        
        if (row === cluster.topRow + 1) {
          cellType = "header"; // R1C1 is header
        } else {
          cellType = "item"; // R2C1 and beyond are items
        }
        
        const cell = CoreList.createCell(
          { row: row - 1, col: col - 1 }, // Convert to 0-indexed
          content.trim(),
          cellType
        );
        
        list.addCell(cell);
      }
    }
  }

  /**
   * Process horizontal (transposed) list structure
   * Cluster is guaranteed to be single row with at least 2 cells
   */
  private processHorizontalList(cluster: CellCluster, list: CoreList): void {
    const row = cluster.topRow + 1; // Single row for horizontal lists
    
    for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
      const content = this.grid.getCellRaw(row, col);
      
      if (content && content.trim()) {
        let cellType: "header" | "item";
        
        if (col === cluster.leftCol + 1) {
          cellType = "header"; // R1C1 is header
        } else {
          cellType = "item"; // R1C2 and beyond are items
        }
        
        const cell = CoreList.createCell(
          { row: row - 1, col: col - 1 }, // Convert to 0-indexed
          content.trim(),
          cellType
        );
        
        list.addCell(cell);
      }
    }
  }

  /**
   * Create a Core Tree construct
   */
  private createTree(cluster: CellCluster, detection: DetectionResult): CoreTree {
    const treeId = `tree_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const tree = new CoreTree(
      treeId,
      `core-tree-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      },
      detection.orientation || "regular"
    );

    // Set child header flag based on key
    if (detection.hasChildHeader) {
      tree.metadata.hasChildHeader = true;
    }

    // Process tree elements based on spatial hierarchy
    this.processTreeElements(cluster, tree, detection.orientation || "regular");
    
    return tree;
  }

  /**
   * Process tree elements and establish hierarchy
   */
  private processTreeElements(cluster: CellCluster, tree: CoreTree, orientation: string): void {
    const elements: TreeElement[] = [];
    
    // Collect all filled cells and analyze hierarchy
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          // Calculate level based on indentation and spatial position
          const level = this.calculateTreeLevel(content, orientation, row, col, cluster);
          
          // Determine element type based on position and content
          const elementType = this.determineTreeElementType(
            content, row, col, level, cluster
          );
          
          const element = CoreTree.createElement(
            { row: row - 1, col: col - 1 }, // Convert to 0-indexed
            content.trim(),
            elementType,
            level
          );
          
          elements.push(element);
        }
      }
    }

    // Sort elements by position (top-to-bottom, left-to-right)
    elements.sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });

    // Establish parent-child relationships
    this.establishTreeHierarchy(elements, tree);
    
    // Calculate advanced domain regions and parse nested constructs
    this.calculateAdvancedDomains(tree);
    tree.parseNestedConstructsInDomains(this.grid, this);
  }

  /**
   * Calculate tree level based on indentation AND spatial position
   */
  private calculateTreeLevel(content: string, orientation: string, row: number, col: number, cluster: CellCluster): number {
    // First check content indentation
    const leadingSpaces = content.match(/^(\s*)/)?.[1]?.length || 0;
    const contentLevel = Math.floor(leadingSpaces / 2);
    
    // Also consider spatial position relative to cluster origin
    let spatialLevel = 0;
    if (orientation === "regular") {
      // Regular orientation: level increases with column distance from left
      spatialLevel = col - cluster.leftCol - 1; // Convert to 0-indexed relative position
    } else {
      // Transposed orientation: level increases with row distance from top
      spatialLevel = row - cluster.topRow - 1; // Convert to 0-indexed relative position
    }
    
    // Use the maximum of content level and spatial level
    return Math.max(contentLevel, Math.max(0, spatialLevel));
  }

  /**
   * Determine tree element type based on spatial position and level
   */
  private determineTreeElementType(
    content: string,
    row: number,
    col: number,
    level: number,
    cluster: CellCluster
  ): TreeElementType {
    // First cell is usually anchor
    if (row === cluster.topRow + 1 && col === cluster.leftCol + 1) {
      return "anchor";
    }
    
    // Elements at level 0 or 1 can be parents (allowing for spatial offset)
    if (level <= 1) {
      return "parent";
    }
    
    // Higher level elements are children for now - hierarchy establishment will refine this
    return "child";
  }

  /**
   * Establish parent-child relationships in tree
   */
  private establishTreeHierarchy(elements: TreeElement[], tree: CoreTree): void {
    const levelStack: TreeElement[] = [];

    for (const element of elements) {
      // Remove elements from stack that are at same or higher level
      while (
        levelStack.length > 0 &&
        levelStack[levelStack.length - 1].level >= element.level
      ) {
        levelStack.pop();
      }

      // If there's an element in the stack, it's our parent
      if (levelStack.length > 0) {
        const parent = levelStack[levelStack.length - 1];
        element.parent = parent;
        parent.children.push(element);
        
        // Update parent type if it now has children
        if (parent.elementType === "child") {
          parent.elementType = "parent";
        }
      }

      // Add current element to stack and tree
      levelStack.push(element);
      tree.addElement(element);
    }

    // Calculate domain regions for parent elements
    for (const parent of tree.parentElements) {
      tree.calculateDomainRegion(parent);
    }
  }

  /**
   * Calculate advanced domain regions using next peer/ancestor algorithm
   */
  private calculateAdvancedDomains(tree: CoreTree): void {
    for (const parent of tree.parentElements) {
      tree.calculateAdvancedDomainRegion(parent, this.grid);
    }
  }
}