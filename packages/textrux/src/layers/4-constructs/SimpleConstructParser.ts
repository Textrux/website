import GridModel from "../1-substrate/GridModel";
import CellCluster from "../3-foundation/cell-cluster/CellCluster";
import { SimpleDetectionRules, DetectionResult } from "../3-foundation/cell-cluster/SimpleDetectionRules";
import { SimpleTree, TreeElement, TreeElementType } from "./cell-cluster/tree/SimpleTree";
import { SimpleTable, TableCell } from "./cell-cluster/table/SimpleTable";
import { SimpleMatrix, MatrixCell } from "./cell-cluster/matrix/SimpleMatrix";
import { SimpleKeyValue, KeyValueCell } from "./cell-cluster/key-value/SimpleKeyValue";
import { BaseConstruct } from "./interfaces/ConstructInterfaces";

/**
 * Unified Simple Construct Parser
 * Replaces all complex signature parsers with elegant pattern-based construction
 */
export class SimpleConstructParser {
  private grid: GridModel;
  private detector: SimpleDetectionRules;

  constructor(grid: GridModel) {
    this.grid = grid;
    this.detector = new SimpleDetectionRules(grid);
  }

  /**
   * Parse a cell cluster and create the appropriate construct
   */
  parseConstruct(cluster: CellCluster): BaseConstruct | null {
    // Detect construct type using simple rules
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
      default:
        return null;
    }
  }

  /**
   * Create a Simple Table construct
   */
  private createTable(cluster: CellCluster, detection: DetectionResult): SimpleTable {
    const tableId = `table_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const table = new SimpleTable(
      tableId,
      detection.confidence,
      "simple-table",
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      }
    );

    // Add all cells (tables have all cells filled)
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          // Determine if this is a header cell (first row or first column)
          const isHeaderRow = row === cluster.topRow + 1;
          const isHeaderCol = col === cluster.leftCol + 1;
          const cellType = (isHeaderRow || isHeaderCol) ? "header" : "body";
          
          const cell = SimpleTable.createCell(
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
   * Create a Simple Matrix construct
   */
  private createMatrix(cluster: CellCluster, detection: DetectionResult): SimpleMatrix {
    const matrixId = `matrix_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const matrix = new SimpleMatrix(
      matrixId,
      detection.confidence,
      "simple-matrix",
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      }
    );

    // Add all cells except the empty corner (R1C1)
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
        // Skip R1C1 (empty corner)
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
          
          const cell = SimpleMatrix.createCell(
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
   * Create a Simple Key-Value construct
   */
  private createKeyValue(cluster: CellCluster, detection: DetectionResult): SimpleKeyValue {
    const keyValueId = `keyvalue_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const keyValue = new SimpleKeyValue(
      keyValueId,
      detection.confidence,
      "simple-key-value",
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      },
      detection.orientation || "regular"
    );

    // Process cells based on orientation
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
   * Process vertical (regular) key-value structure
   */
  private processVerticalKeyValues(cluster: CellCluster, keyValue: SimpleKeyValue): void {
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
            // Skip gap cells (R2C1, R1C2)
            continue;
          }
          
          const cell = SimpleKeyValue.createCell(
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
   * Process horizontal (transposed) key-value structure
   */
  private processHorizontalKeyValues(cluster: CellCluster, keyValue: SimpleKeyValue): void {
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
            // Skip gap cells (R1C2, R2C1)
            continue;
          }
          
          const cell = SimpleKeyValue.createCell(
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
   * Create a Simple Tree construct
   */
  private createTree(cluster: CellCluster, detection: DetectionResult): SimpleTree {
    const treeId = `tree_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    const tree = new SimpleTree(
      treeId,
      detection.confidence,
      "simple-tree",
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol
      },
      detection.orientation || "regular"
    );

    // Process tree elements based on spatial hierarchy
    this.processTreeElements(cluster, tree, detection.orientation || "regular");
    
    return tree;
  }

  /**
   * Process tree elements and establish hierarchy
   */
  private processTreeElements(cluster: CellCluster, tree: SimpleTree, orientation: string): void {
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
          
          const element = SimpleTree.createElement(
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
    tree.parseNestedConstructsInDomains(this.grid);
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
  private establishTreeHierarchy(elements: TreeElement[], tree: SimpleTree): void {
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
  private calculateAdvancedDomains(tree: SimpleTree): void {
    for (const parent of tree.parentElements) {
      tree.calculateAdvancedDomainRegion(parent, this.grid);
    }
  }
}