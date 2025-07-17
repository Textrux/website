import GridModel from "../1-substrate/GridModel";
import CellCluster from "../3-foundation/cell-cluster/CellCluster";
import {
  CoreDetectionRules,
  DetectionResult,
} from "../3-foundation/cell-cluster/CoreDetectionRules";
import { CoreTree, TreeElement } from "./cell-cluster/CoreTree";
import { CoreTable, TableCell, TableCellType } from "./cell-cluster/CoreTable";
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
  private createTable(
    cluster: CellCluster,
    detection: DetectionResult
  ): CoreTable {
    const tableId = `table_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;

    const table = new CoreTable(tableId, `core-table-key-${detection.key}`, {
      topRow: cluster.topRow,
      bottomRow: cluster.bottomRow,
      leftCol: cluster.leftCol,
      rightCol: cluster.rightCol,
    });

    // Add all cells from the cluster's filled points
    for (const point of cluster.filledPoints) {
      const content = this.grid.getCellRaw(point.row, point.col);
      if (content && content.trim()) {
        // Determine cell type for table: only first row OR only first column are headers, not both
        // Use cluster bounds directly since they are now 1-indexed
        const isFirstRow = point.row === cluster.topRow;
        const isFirstCol = point.col === cluster.leftCol;

        // For this table structure: only first row contains headers
        // First column of subsequent rows are body cells, not headers
        let cellType: TableCellType;
        if (isFirstRow) {
          cellType = "header"; // Column header (first row only)
        } else {
          cellType = "body"; // All other cells are body cells (including first column of other rows)
        }

        const cell = CoreTable.createCell(
          { row: point.row, col: point.col }, // Use actual coordinates
          content.trim(),
          cellType
        );

        table.addCell(cell);
      }
    }

    // Organize into entities and attributes
    table.organizeEntitiesAndAttributes();

    // Debug: Show parsed table structure
    console.log(`📊 Table Structure Debug:
    Table ID: ${table.id}
    Bounds: R${table.bounds.topRow}C${table.bounds.leftCol} to R${table.bounds.bottomRow}C${table.bounds.rightCol}
    Total cells: ${table.cells.length}
    Header cells: ${table.headerCells.length}
    Body cells: ${table.bodyCells.length}
    Entities (rows): ${table.entities.length}
    Attributes (columns): ${table.attributes.length}`);

    // Show header cells
    if (table.headerCells.length > 0) {
      console.log(
        "Header cells:",
        table.headerCells.map(
          (h) => `(${h.position.row},${h.position.col}): "${h.content}"`
        )
      );
    }

    // Show entities structure
    if (table.entities.length > 0) {
      console.log(
        "Entities (rows):",
        table.entities.map(
          (e) =>
            `Row ${e.index}: ${
              e.headerCell ? `"${e.headerCell.content}"` : "no header"
            } + ${e.bodyCells.length} body cells`
        )
      );
    }

    return table;
  }

  /**
   * Create a Core Matrix construct
   */
  private createMatrix(
    cluster: CellCluster,
    detection: DetectionResult
  ): CoreMatrix {
    const matrixId = `matrix_${cluster.leftCol}_${
      cluster.topRow
    }_${Date.now()}`;

    const matrix = new CoreMatrix(
      matrixId,
      `core-matrix-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
      }
    );

    // Add all cells except the empty corner (R1C1) by definition of key=7
    // Use cluster bounds directly since they are now 1-indexed
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        // Skip R1C1 (empty corner) - this is what makes it key=7
        if (row === cluster.topRow && col === cluster.leftCol) {
          continue;
        }

        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          // Determine cell type
          let cellType: "primary-header" | "secondary-header" | "body";

          if (row === cluster.topRow) {
            cellType = "primary-header"; // First row headers
          } else if (col === cluster.leftCol) {
            cellType = "secondary-header"; // First column headers
          } else {
            cellType = "body"; // Body cells
          }

          const cell = CoreMatrix.createCell(
            { row: row, col: col }, // Use actual 1-indexed coordinates
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
  private createKeyValue(
    cluster: CellCluster,
    detection: DetectionResult
  ): CoreKeyValue {
    const keyValueId = `keyvalue_${cluster.leftCol}_${
      cluster.topRow
    }_${Date.now()}`;

    const keyValue = new CoreKeyValue(
      keyValueId,
      `core-keyvalue-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
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
  private processVerticalKeyValues(
    cluster: CellCluster,
    keyValue: CoreKeyValue
  ): void {
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          let cellType: "main-header" | "key" | "value" | "marker";

          if (row === cluster.topRow && col === cluster.leftCol) {
            cellType = "main-header"; // R1C1 is main header
          } else if (col === cluster.leftCol + 1) {
            cellType = "key"; // Second column contains keys (starting at R2C2)
          } else if (col > cluster.leftCol + 1) {
            cellType = "value"; // Columns beyond second contain values
          } else {
            // Skip gap cells (R2C1, R1C2) - these are empty by definition of key=9
            continue;
          }

          const cell = CoreKeyValue.createCell(
            { row: row, col: col }, // Use actual 1-indexed coordinates
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
  private processHorizontalKeyValues(
    cluster: CellCluster,
    keyValue: CoreKeyValue
  ): void {
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        const content = this.grid.getCellRaw(row, col);
        if (content && content.trim()) {
          let cellType: "main-header" | "key" | "value" | "marker";

          if (row === cluster.topRow && col === cluster.leftCol) {
            cellType = "main-header"; // R1C1 is main header
          } else if (row === cluster.topRow + 1) {
            cellType = "key"; // Second row contains keys (starting at R2C2)
          } else if (row > cluster.topRow + 1) {
            cellType = "value"; // Rows beyond second contain values
          } else {
            // Skip gap cells (R1C2, R2C1) - these are empty by definition of key=9
            continue;
          }

          const cell = CoreKeyValue.createCell(
            { row: row, col: col }, // Use actual 1-indexed coordinates
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
  private createList(
    cluster: CellCluster,
    detection: DetectionResult
  ): CoreList {
    const listId = `list_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;

    const list = new CoreList(
      listId,
      `core-list-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
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
    const col = cluster.leftCol; // Single column for vertical lists (now 1-indexed)

    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      const content = this.grid.getCellRaw(row, col);

      if (content && content.trim()) {
        let cellType: "header" | "item";

        if (row === cluster.topRow) {
          cellType = "header"; // R1C1 is header
        } else {
          cellType = "item"; // R2C1 and beyond are items
        }

        const cell = CoreList.createCell(
          { row: row, col: col }, // Use actual 1-indexed coordinates
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
    const row = cluster.topRow; // Single row for horizontal lists (now 1-indexed)

    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      const content = this.grid.getCellRaw(row, col);

      if (content && content.trim()) {
        let cellType: "header" | "item";

        if (col === cluster.leftCol) {
          cellType = "header"; // R1C1 is header
        } else {
          cellType = "item"; // R1C2 and beyond are items
        }

        const cell = CoreList.createCell(
          { row: row, col: col }, // Use actual 1-indexed coordinates
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
  private createTree(
    cluster: CellCluster,
    detection: DetectionResult
  ): CoreTree {
    const treeId = `tree_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;

    const tree = new CoreTree(
      treeId,
      `core-tree-key-${detection.key}`,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
      },
      detection.orientation || "regular"
    );

    // Set child header flag based on key
    if (detection.hasChildHeader) {
      tree.metadata.hasChildHeader = true;
    }

    // Process tree elements based on spatial hierarchy
    this.processTreeElements(cluster, tree, detection.orientation || "regular");

    // Debug: Show parsed tree structure
    console.log(`🌳 Tree Structure Debug:
    Tree ID: ${tree.id}
    Orientation: ${tree.orientation}
    Bounds: R${tree.bounds.topRow}C${tree.bounds.leftCol} to R${
      tree.bounds.bottomRow
    }C${tree.bounds.rightCol}
    Total elements: ${tree.elements.length}
    Has child header: ${tree.childHeaderElements?.length > 0 || false}
    Parent elements: ${tree.parentElements.length}
    Child elements: ${tree.childElements.length}
    Child header elements: ${tree.childHeaderElements?.length || 0}
    Peer elements: ${tree.peerElements.length}`);

    // Show tree hierarchy
    if (tree.elements.length > 0) {
      console.log(
        "Tree elements:",
        tree.elements.map((e) => {
          const roles = [];
          if (e.isAnchor()) roles.push("anchor");
          if (e.isParent()) roles.push("parent");
          if (e.isChild()) roles.push("child");
          if (e.isChildHeader()) roles.push("child-header");
          if (e.isPeer()) roles.push("peer");

          return `(${e.position.row},${e.position.col}): "${
            e.content
          }" [${roles.join(", ")}, level ${e.level}]`;
        })
      );
    }

    // Show anchor element
    if (tree.anchorElement) {
      console.log(
        `Anchor: (${tree.anchorElement.position.row},${tree.anchorElement.position.col}): "${tree.anchorElement.content}"`
      );
    }

    return tree;
  }

  /**
   * Process tree elements and establish hierarchy
   */
  private processTreeElements(
    cluster: CellCluster,
    tree: CoreTree,
    orientation: string
  ): void {
    const elements: TreeElement[] = [];

    // Collect all filled cells from the cluster and analyze hierarchy
    for (const point of cluster.filledPoints) {
      const content = this.grid.getCellRaw(point.row, point.col);
      if (content && content.trim()) {
        // Calculate level based on indentation and spatial position
        const level = this.calculateTreeLevel(
          content,
          orientation,
          point.row,
          point.col,
          cluster
        );

        const element = CoreTree.createElement(
          { row: point.row, col: point.col }, // Use actual coordinates
          content.trim(),
          level,
          undefined, // parent will be set later
          tree,
          cluster.filledPoints // Pass filled points for child header detection
        );

        elements.push(element);
      }
    }

    // Sort elements by position based on tree orientation
    if (orientation === "regular") {
      // Regular trees: top-to-bottom, left-to-right
      elements.sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
      });
    } else {
      // Transposed trees: left-to-right, top-to-bottom
      elements.sort((a, b) => {
        if (a.position.col !== b.position.col) {
          return a.position.col - b.position.col;
        }
        return a.position.row - b.position.row;
      });
    }

    // Establish parent-child relationships
    this.establishTreeHierarchy(elements, tree);

    // Calculate advanced domain regions and parse nested constructs
    this.calculateAdvancedDomains(tree);
    tree.parseNestedConstructsInDomains(this.grid, this);
  }

  /**
   * Calculate tree level based on spatial position in tree structure
   */
  private calculateTreeLevel(
    content: string,
    orientation: string,
    row: number,
    col: number,
    cluster: CellCluster
  ): number {
    // First check content indentation
    const leadingSpaces = content.match(/^(\s*)/)?.[1]?.length || 0;
    const contentLevel = Math.floor(leadingSpaces / 2);

    // Calculate spatial level based on column position for regular orientation
    let spatialLevel = 0;
    if (orientation === "regular") {
      // Column position determines level: leftmost = 0, next column = 1, etc.
      // Use cluster bounds directly since they are now 1-indexed
      spatialLevel = col - cluster.leftCol;
    } else {
      // Transposed orientation: row position determines level
      // Use cluster bounds directly since they are now 1-indexed
      spatialLevel = row - cluster.topRow;
    }

    // Use the maximum of content level and spatial level
    return Math.max(contentLevel, Math.max(0, spatialLevel));
  }

  // Removed determineTreeElementType - now handled by TreeElement role methods

  /**
   * Establish parent-child relationships in tree
   */
  private establishTreeHierarchy(
    elements: TreeElement[],
    tree: CoreTree
  ): void {
    const levelStack: TreeElement[] = [];

    for (const element of elements) {
      // Removed excessive logging

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
        // Parent-child relationship established

        // Parent-child relationship established - roles are determined dynamically
      }

      // Elements at the same level are peers, but anchor and childHeader elements are not peers
      for (const stackElement of levelStack) {
        if (stackElement.level === element.level && stackElement !== element) {
          // Don't assign peer relationships to anchor elements or childHeader elements
          const elementIsAnchor = element.isAnchor();
          const stackElementIsAnchor = stackElement.isAnchor();
          const elementIsChildHeader = element.isChildHeader();
          const stackElementIsChildHeader = stackElement.isChildHeader();

          if (
            !elementIsAnchor &&
            !stackElementIsAnchor &&
            !elementIsChildHeader &&
            !stackElementIsChildHeader
          ) {
            stackElement.peers.push(element);
            element.peers.push(stackElement);
          }
        }
      }

      // Add current element to stack and tree
      levelStack.push(element);
      tree.addElement(element);
    }

    // After hierarchy is established, recalculate peer relationships more accurately
    this.establishPeerRelationships(elements, tree);

    // Recategorize elements now that parent-child relationships are established
    this.recategorizeTreeElements(tree);

    // Populate items arrays for anchor and childHeader elements after tree is fully built
    this.populateTreeElementItems(tree);

    // Calculate domain regions for parent elements
    for (const parent of tree.parentElements) {
      tree.calculateDomainRegion(parent);
    }
  }

  /**
   * Recategorize tree elements after hierarchy is established
   */
  private recategorizeTreeElements(tree: CoreTree): void {
    // Clear existing categorization
    tree.anchorElement = undefined;
    tree.parentElements = [];
    tree.childElements = [];
    tree.childHeaderElements = [];
    tree.peerElements = [];

    // Recategorize all elements with proper exclusions
    for (const element of tree.elements) {
      if (element.isAnchor()) {
        tree.anchorElement = element;
      }
      if (element.isParent()) {
        tree.parentElements.push(element);
      }
      if (element.isChildHeader()) {
        tree.childHeaderElements.push(element);
      } else if (element.isChild()) {
        // Only add to childElements if it's NOT a childHeader
        tree.childElements.push(element);
      }
      if (element.isPeer() && !element.isChildHeader()) {
        // Only add to peerElements if it's NOT a childHeader
        tree.peerElements.push(element);
      }
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

  /**
   * Establish peer relationships among elements at the same level
   */
  private establishPeerRelationships(
    elements: TreeElement[],
    tree: CoreTree
  ): void {
    // Group elements by level
    const elementsByLevel = new Map<number, TreeElement[]>();

    for (const element of elements) {
      if (!elementsByLevel.has(element.level)) {
        elementsByLevel.set(element.level, []);
      }
      elementsByLevel.get(element.level)!.push(element);
    }

    // For each level, establish peer relationships
    for (const [level, levelElements] of elementsByLevel) {
      if (levelElements.length > 1) {
        for (let i = 0; i < levelElements.length; i++) {
          for (let j = i + 1; j < levelElements.length; j++) {
            const elem1 = levelElements[i];
            const elem2 = levelElements[j];

            // Only consider elements peers if they have the same parent
            // AND neither is an anchor or childHeader element
            if (elem1.parent === elem2.parent) {
              const elem1IsAnchor = elem1.isAnchor();
              const elem2IsAnchor = elem2.isAnchor();
              const elem1IsChildHeader = elem1.isChildHeader();
              const elem2IsChildHeader = elem2.isChildHeader();

              if (
                !elem1IsAnchor &&
                !elem2IsAnchor &&
                !elem1IsChildHeader &&
                !elem2IsChildHeader
              ) {
                if (!elem1.peers.includes(elem2)) elem1.peers.push(elem2);
                if (!elem2.peers.includes(elem1)) elem2.peers.push(elem1);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Populate items arrays for anchor and childHeader elements after tree is fully built
   */
  private populateTreeElementItems(tree: CoreTree): void {
    // Populate items for anchor element
    if (tree.anchorElement) {
      tree.anchorElement.items = [];
      // For anchor elements, add all other elements in the first column as items
      const firstCol = tree.bounds.leftCol + 1; // Convert to 1-indexed
      tree.anchorElement.items = tree.elements.filter(
        (el) => el.position.col === firstCol && el !== tree.anchorElement
      );
    }

    // Populate items for childHeader elements
    for (const childHeader of tree.childHeaderElements) {
      childHeader.items = [];

      if (tree.orientation === "regular") {
        // Regular orientation: items are directly below the childHeader
        childHeader.items = tree.elements.filter(
          (el) =>
            el.position.col === childHeader.position.col &&
            el.position.row > childHeader.position.row
        );
      } else {
        // Transposed orientation: items are directly to the right of the childHeader
        childHeader.items = tree.elements.filter(
          (el) =>
            el.position.row === childHeader.position.row &&
            el.position.col > childHeader.position.col
        );
      }
    }
  }
}
