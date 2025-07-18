import { BaseConstruct, BaseElement } from "../interfaces/ConstructInterfaces";
import GridModel from "../../1-substrate/GridModel";
import CellCluster from "../../3-foundation/cell-cluster/CellCluster";

/**
 * Core Tree construct based on Cell Cluster Key system
 * Replaces the over-engineered Tree.ts with elegant simplicity
 */

export type TreeOrientation = "regular" | "transposed";

export interface TreeElement {
  position: { row: number; col: number };
  content: string;
  level: number;
  parent?: TreeElement;
  children: TreeElement[];
  peers: TreeElement[];
  domainRegion?: DomainRegion;
  items?: TreeElement[]; // For anchor and childHeader elements
  valueElements?: TreeElement[]; // For key elements that have values
  domainConstructType?: "matrix" | "table" | "key-value" | "children" | null; // Type of construct in domain
  childConstructs?: BaseConstruct[]; // Nested constructs within this element's domain

  // Role-based methods
  isAnchor(): boolean;
  isParent(): boolean;
  isChild(): boolean;
  isChildHeader(): boolean;
  isPeer(): boolean;
  isKey(): boolean;
  isKeyValue(): boolean;
  hasMatrixConstruct(): boolean;
  hasTableConstruct(): boolean;
  hasKeyValueConstruct(): boolean;
  getDomainConstructType():
    | "matrix"
    | "table"
    | "key-value"
    | "children"
    | null;
}

export interface DomainRegion {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  nestedConstruct?: "table" | "matrix" | "key-value";
  nestedConstructInstance?: BaseConstruct;
  parsedSuccessfully?: boolean;
}

export class CoreTree implements BaseConstruct {
  id: string;
  type: string = "tree";
  keyPattern: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  // Tree-specific properties
  orientation: TreeOrientation;
  elements: TreeElement[];
  anchorElement?: TreeElement;
  parentElements: TreeElement[];
  childElements: TreeElement[];
  childHeaderElements: TreeElement[];
  peerElements: TreeElement[];
  childConstructs: BaseConstruct[];

  constructor(
    id: string,
    keyPattern: string,
    bounds: {
      topRow: number;
      bottomRow: number;
      leftCol: number;
      rightCol: number;
    },
    orientation: TreeOrientation = "regular"
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
    this.bounds = bounds;
    this.orientation = orientation;
    this.elements = [];
    this.parentElements = [];
    this.childElements = [];
    this.childHeaderElements = [];
    this.peerElements = [];
    this.metadata = {};
    this.childConstructs = [];
  }

  /**
   * Add an element to the tree
   */
  addElement(element: TreeElement): void {
    this.elements.push(element);

    // Categorize element by role
    if (element.isAnchor()) {
      this.anchorElement = element;
    }
    if (element.isParent()) {
      this.parentElements.push(element);
    }
    if (element.isChild()) {
      this.childElements.push(element);
    }
    if (element.isChildHeader()) {
      this.childHeaderElements.push(element);
    }
    if (element.isPeer()) {
      this.peerElements.push(element);
    }
  }

  /**
   * Calculate domain region for a parent element
   * Domain is the rectangular area containing all descendants
   * For matrix/table constructs, includes all filled cells in the domain area
   */
  calculateDomainRegion(
    parentElement: TreeElement,
    grid?: GridModel
  ): DomainRegion {
    // Determine construct type to know how to calculate domain
    const constructType = parentElement.domainConstructType;

    if (
      constructType === "matrix" ||
      constructType === "table" ||
      constructType === "key-value"
    ) {
      // For matrix/table/key-value constructs, we need to find ALL filled cells in the domain
      return this.calculateDomainRegionForConstruct(parentElement, grid);
    } else {
      // For regular children, use the existing logic
      return this.calculateDomainRegionForChildren(parentElement);
    }
  }

  /**
   * Calculate domain region for matrix/table constructs
   * Uses the preliminary domain bounds and doesn't expand beyond them
   */
  private calculateDomainRegionForConstruct(
    parentElement: TreeElement,
    grid?: GridModel
  ): DomainRegion {
    if (!grid) {
      // Fallback to children calculation if no grid provided
      return this.calculateDomainRegionForChildren(parentElement);
    }

    const parentRow = parentElement.position.row;
    const parentCol = parentElement.position.col;

    // First, get the existing domain region if it exists (from detectDomainConstructType)
    if (!parentElement.domainRegion) {
      // Calculate a preliminary domain region
      this.calculateDomainRegionForChildren(parentElement);
    }

    const preliminaryDomain = parentElement.domainRegion;
    if (!preliminaryDomain) {
      return {
        topRow: parentRow,
        bottomRow: parentRow,
        leftCol: parentCol,
        rightCol: parentCol,
      };
    }

    // Use the preliminary domain bounds as the correct domain
    // The preliminary domain should already be correct from tree element analysis
    let minRow = preliminaryDomain.topRow;
    let maxRow = preliminaryDomain.bottomRow;
    let minCol = preliminaryDomain.leftCol;
    let maxCol = preliminaryDomain.rightCol;

    // For regular trees, domain should start from next column after parent
    if (this.orientation === "regular") {
      minCol = Math.max(minCol, parentCol + 1);
      minRow = Math.max(minRow, parentRow); // Domain starts from parent's row, not above it
    } else {
      // For transposed trees, domain should start from next row after parent
      minRow = Math.max(minRow, parentRow + 1);
      minCol = Math.max(minCol, parentCol); // Domain starts from parent's column, not left of it
    }

    // Find all filled cells within the correct domain bounds
    let filledCellsFound = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const content = grid.getCellRaw(row, col);
        if (content && content.trim()) {
          filledCellsFound.push({ row, col, content });
        }
      }
    }

    // Debug logging
    // console.log(`Domain calculation for parent at (${parentRow}, ${parentCol}):`);
    // console.log(`  Preliminary domain: rows ${preliminaryDomain.topRow}-${preliminaryDomain.bottomRow}, cols ${preliminaryDomain.leftCol}-${preliminaryDomain.rightCol}`);
    // console.log(`  Corrected domain: rows ${minRow}-${maxRow}, cols ${minCol}-${maxCol}`);
    // console.log(`  Filled cells found:`, filledCellsFound);

    const domain: DomainRegion = {
      topRow: minRow,
      bottomRow: maxRow,
      leftCol: minCol,
      rightCol: maxCol,
    };

    // Store domain in parent element
    parentElement.domainRegion = domain;

    return domain;
  }

  /**
   * Calculate domain region for regular children constructs
   * Uses existing logic based on tree elements
   */
  private calculateDomainRegionForChildren(
    parentElement: TreeElement
  ): DomainRegion {
    if (
      parentElement.children.length === 0 &&
      (!parentElement.valueElements || parentElement.valueElements.length === 0)
    ) {
      // No children and no values, domain doesn't exist
      return {
        topRow: parentElement.position.row,
        bottomRow: parentElement.position.row,
        leftCol: parentElement.position.col,
        rightCol: parentElement.position.col,
      };
    }

    // Start domain from next column/row after parent based on orientation
    let startRow = parentElement.position.row;
    let startCol = parentElement.position.col;

    if (this.orientation === "regular") {
      // Regular trees: domain starts from next column to the right
      startCol = parentElement.position.col + 1;
    } else {
      // Transposed trees: domain starts from next row below
      startRow = parentElement.position.row + 1;
    }

    // Find bounding box of all descendants and values
    const allDescendants = this.getAllDescendants(parentElement);
    const valueElements = parentElement.valueElements || [];
    const allElements = [...allDescendants, ...valueElements];

    if (allElements.length === 0) {
      // No descendants or values, minimal domain
      return {
        topRow: startRow,
        bottomRow: startRow,
        leftCol: startCol,
        rightCol: startCol,
      };
    }

    const positions = allElements.map((d) => d.position);

    const minRow = Math.min(startRow, ...positions.map((p) => p.row));
    const maxRow = Math.max(startRow, ...positions.map((p) => p.row));
    const minCol = Math.min(startCol, ...positions.map((p) => p.col));
    const maxCol = Math.max(startCol, ...positions.map((p) => p.col));

    const domain: DomainRegion = {
      topRow: minRow,
      bottomRow: maxRow,
      leftCol: minCol,
      rightCol: maxCol,
    };

    // Store domain in parent element
    parentElement.domainRegion = domain;

    return domain;
  }

  /**
   * Advanced domain calculation using next peer/ancestor algorithm
   * Finds domain boundary based on next peer or ancestor, whichever comes first
   * Domain starts from the next column/row after the parent, not including the parent itself
   */
  calculateAdvancedDomainRegion(
    parentElement: TreeElement,
    grid: GridModel
  ): DomainRegion {
    // Start domain from next column/row after parent based on orientation
    let topRow = parentElement.position.row;
    let leftCol = parentElement.position.col;
    let bottomRow = parentElement.position.row;
    let rightCol = parentElement.position.col;

    if (this.orientation === "regular") {
      // Regular trees: domain starts from next column to the right
      leftCol = parentElement.position.col + 1;
      rightCol = parentElement.position.col + 1;
    } else {
      // Transposed trees: domain starts from next row below
      topRow = parentElement.position.row + 1;
      bottomRow = parentElement.position.row + 1;
    }

    // Find the next peer or ancestor to establish domain boundary
    const nextBoundary = this.findNextPeerOrAncestor(parentElement);

    if (nextBoundary) {
      // Domain extends from parent to just before the boundary
      if (this.orientation === "regular") {
        // Regular orientation: domain grows down and right
        bottomRow = nextBoundary.position.row - 1;
        rightCol = this.findLastFilledColumn(topRow, bottomRow, leftCol, grid);
      } else {
        // Transposed orientation: domain grows right and down
        rightCol = nextBoundary.position.col - 1;
        bottomRow = this.findLastFilledRow(topRow, leftCol, rightCol, grid);
      }
    } else {
      // No boundary found, use tree bounds
      if (this.orientation === "regular") {
        bottomRow = this.bounds.bottomRow;
        rightCol = this.findLastFilledColumn(topRow, bottomRow, leftCol, grid);
      } else {
        rightCol = this.bounds.rightCol;
        bottomRow = this.findLastFilledRow(topRow, leftCol, rightCol, grid);
      }
    }

    // Include all descendants and values in domain
    const allDescendants = this.getAllDescendants(parentElement);
    const valueElements = parentElement.valueElements || [];
    const allElements = [...allDescendants, ...valueElements];

    if (allElements.length > 0) {
      const elementPositions = allElements.map((d) => d.position);
      bottomRow = Math.max(bottomRow, ...elementPositions.map((p) => p.row));
      rightCol = Math.max(rightCol, ...elementPositions.map((p) => p.col));
    }

    const domain: DomainRegion = {
      topRow,
      bottomRow,
      leftCol,
      rightCol,
    };

    // Store domain in parent element
    parentElement.domainRegion = domain;

    return domain;
  }

  /**
   * Find the next peer or ancestor element after the given parent
   */
  private findNextPeerOrAncestor(
    parentElement: TreeElement
  ): TreeElement | null {
    const parentLevel = parentElement.level;
    const parentRow = parentElement.position.row;

    // Look for elements at same level or higher (lower level number) that come after this parent
    const candidates = this.elements.filter(
      (element) =>
        element.level <= parentLevel && element.position.row > parentRow
    );

    // Sort by row position and return the first one
    candidates.sort((a, b) => a.position.row - b.position.row);
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Find the last filled column in a row range (for regular orientation)
   */
  private findLastFilledColumn(
    topRow: number,
    bottomRow: number,
    startCol: number,
    grid: GridModel
  ): number {
    let lastFilledCol = startCol;

    for (let row = topRow; row <= bottomRow; row++) {
      for (let col = startCol; col <= this.bounds.rightCol; col++) {
        const content = grid.getCellRaw(row + 1, col + 1); // Convert to 1-indexed
        if (content && content.trim()) {
          lastFilledCol = Math.max(lastFilledCol, col);
        }
      }
    }

    return lastFilledCol;
  }

  /**
   * Find the last filled row in a column range (for transposed orientation)
   */
  private findLastFilledRow(
    startRow: number,
    leftCol: number,
    rightCol: number,
    grid: GridModel
  ): number {
    let lastFilledRow = startRow;

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = startRow; row <= this.bounds.bottomRow; row++) {
        const content = grid.getCellRaw(row + 1, col + 1); // Convert to 1-indexed
        if (content && content.trim()) {
          lastFilledRow = Math.max(lastFilledRow, row);
        }
      }
    }

    return lastFilledRow;
  }

  /**
   * Detect the type of construct in a parent element's domain region
   * Returns 'matrix', 'table', 'key-value', 'children', or null based on spatial pattern
   */
  detectDomainConstructType(
    parentElement: TreeElement,
    grid: GridModel
  ): "matrix" | "table" | "key-value" | "children" | null {
    // Calculate domain region if not already calculated
    if (!parentElement.domainRegion) {
      this.calculateDomainRegion(parentElement, grid);
    }

    const domain = parentElement.domainRegion;
    if (!domain) return null;

    // Check if there are any filled cells in the domain region
    const filledCells: Array<{ row: number; col: number }> = [];
    for (let row = domain.topRow; row <= domain.bottomRow; row++) {
      for (let col = domain.leftCol; col <= domain.rightCol; col++) {
        const content = grid.getCellRaw(row, col);
        if (content && content.trim()) {
          filledCells.push({ row, col });
        }
      }
    }

    if (filledCells.length === 0) return null;

    // First check for key-value pattern using binary key detection
    const keyValuePattern = this.checkKeyValuePattern(domain, grid);
    if (keyValuePattern) {
      return "key-value";
    }

    // Determine the parent's row/column for analysis
    const parentRow = parentElement.position.row;
    const parentCol = parentElement.position.col;

    if (this.orientation === "regular") {
      // Regular orientation: check for cells past the next column
      const nextCol = parentCol + 1;

      // Find all filled cells in the parent's row within the domain
      const parentRowCells = filledCells.filter(
        (cell) => cell.row === parentRow
      );

      // Check if there are cells past the next column
      const cellsPastNext = parentRowCells.filter((cell) => cell.col > nextCol);

      if (cellsPastNext.length > 0) {
        // There are cells past the next column, determine if matrix or table
        const nextCellContent = grid.getCellRaw(parentRow, nextCol);

        if (nextCellContent && nextCellContent.trim()) {
          // Next cell is filled → Table construct
          return "table";
        } else {
          // Next cell is empty → Matrix construct
          return "matrix";
        }
      } else {
        // No cells past the next column → Regular children
        return "children";
      }
    } else {
      // Transposed orientation: check for cells past the next row
      const nextRow = parentRow + 1;

      // Find all filled cells in the parent's column within the domain
      const parentColCells = filledCells.filter(
        (cell) => cell.col === parentCol
      );

      // Check if there are cells past the next row
      const cellsPastNext = parentColCells.filter((cell) => cell.row > nextRow);

      if (cellsPastNext.length > 0) {
        // There are cells past the next row, determine if matrix or table
        const nextCellContent = grid.getCellRaw(nextRow, parentCol);

        if (nextCellContent && nextCellContent.trim()) {
          // Next cell is filled → Table construct
          return "table";
        } else {
          // Next cell is empty → Matrix construct
          return "matrix";
        }
      } else {
        // No cells past the next row → Regular children
        return "children";
      }
    }
  }

  /**
   * Create a matrix, table, or key-value construct instance for a parent element's domain region
   */
  createDomainConstruct(
    parentElement: TreeElement,
    constructType: "matrix" | "table" | "key-value",
    grid: GridModel,
    parser: any
  ): BaseConstruct | null {
    const domain = parentElement.domainRegion;
    if (!domain) return null;

    // Collect all filled cells in the domain region
    const domainFilledPoints: Array<{ row: number; col: number }> = [];
    for (let row = domain.topRow; row <= domain.bottomRow; row++) {
      for (let col = domain.leftCol; col <= domain.rightCol; col++) {
        const content = grid.getCellRaw(row, col);
        if (content && content.trim()) {
          domainFilledPoints.push({ row, col });
        }
      }
    }

    if (domainFilledPoints.length === 0) return null;

    // Create a cell cluster for the domain region
    const domainCluster = new CellCluster(
      domain.topRow,
      domain.bottomRow,
      domain.leftCol,
      domain.rightCol,
      domainFilledPoints
    );

    // Force the detection result to match the determined construct type
    if (constructType === "matrix") {
      domainCluster.detectionResult = {
        constructType: "matrix",
        key: 7, // Matrix key
        orientation: "regular",
      };
    } else if (constructType === "table") {
      domainCluster.detectionResult = {
        constructType: "table",
        key: 15, // Table key
        orientation: "regular",
      };
    } else if (constructType === "key-value") {
      domainCluster.detectionResult = {
        constructType: "key-value",
        key: 9, // Key-value key
        orientation: "regular",
      };
    } else {
      // For other patterns, use binary key detection
      // but skip list detection since tree domains span multiple rows/columns
      domainCluster.detectionResult = null; // Let binary key detection handle it
    }

    // Create the construct using the parser
    try {
      const construct = parser.parseConstruct(domainCluster);
      if (construct) {
        // Store the construct in the domain region
        domain.nestedConstruct = constructType;
        domain.nestedConstructInstance = construct;
        domain.parsedSuccessfully = true;

        // Update the domain region to match the construct bounds
        domain.topRow = construct.bounds.topRow;
        domain.bottomRow = construct.bounds.bottomRow;
        domain.leftCol = construct.bounds.leftCol;
        domain.rightCol = construct.bounds.rightCol;

        // Add to parent element's childConstructs array
        if (!parentElement.childConstructs) {
          parentElement.childConstructs = [];
        }
        parentElement.childConstructs.push(construct);

        // Add to tree's childConstructs array
        if (!this.childConstructs) {
          this.childConstructs = [];
        }
        this.childConstructs.push(construct);

        // console.log(
        //   `Created ${constructType} construct with bounds: rows ${construct.bounds.topRow}-${construct.bounds.bottomRow}, cols ${construct.bounds.leftCol}-${construct.bounds.rightCol}`
        // );

        return construct;
      }
    } catch (error) {
      console.error(`Failed to create ${constructType} construct:`, error);
    }

    domain.parsedSuccessfully = false;
    return null;
  }

  /**
   * Recursively parse domain regions into nested constructs
   */
  parseNestedConstructsInDomains(grid: GridModel, parser: any): void {
    for (const parent of this.parentElements) {
      if (parent.domainRegion) {
        this.parseNestedConstructInDomain(parent, grid, parser);
      }
    }
  }

  /**
   * Parse a specific domain region into a nested construct
   */
  private parseNestedConstructInDomain(
    parentElement: TreeElement,
    grid: GridModel,
    parser: any
  ): void {
    const domain = parentElement.domainRegion;
    if (!domain) return;

    // Create a cell cluster for the domain region
    const domainFilledPoints: Array<{ row: number; col: number }> = [];

    // Collect filled cells within the domain (excluding the parent cell itself)
    for (let row = domain.topRow; row <= domain.bottomRow; row++) {
      for (let col = domain.leftCol; col <= domain.rightCol; col++) {
        // Skip the parent cell
        if (
          row === parentElement.position.row &&
          col === parentElement.position.col
        ) {
          continue;
        }

        const content = grid.getCellRaw(row + 1, col + 1); // Convert to 1-indexed
        if (content && content.trim()) {
          domainFilledPoints.push({ row: row + 1, col: col + 1 }); // Store as 1-indexed
        }
      }
    }

    // Only parse if we have enough cells for a construct
    if (domainFilledPoints.length < 4) {
      domain.parsedSuccessfully = false;
      return;
    }

    // Create cluster for the domain region
    const domainCluster = new CellCluster(
      domain.topRow,
      domain.bottomRow,
      domain.leftCol,
      domain.rightCol,
      domainFilledPoints
    );

    // Try to parse the domain as a nested construct
    try {
      const nestedConstruct = parser.parseConstruct(domainCluster);

      if (nestedConstruct) {
        domain.nestedConstruct = nestedConstruct.type as
          | "table"
          | "matrix"
          | "key-value";
        domain.nestedConstructInstance = nestedConstruct;
        domain.parsedSuccessfully = true;
      } else {
        domain.parsedSuccessfully = false;
      }
    } catch (error) {
      domain.parsedSuccessfully = false;
    }
  }

  /**
   * Get all descendants (children, grandchildren, etc.) of an element
   */
  private getAllDescendants(element: TreeElement): TreeElement[] {
    const descendants: TreeElement[] = [];

    const collectDescendants = (el: TreeElement) => {
      for (const child of el.children) {
        descendants.push(child);
        collectDescendants(child);
      }
    };

    collectDescendants(element);
    return descendants;
  }

  /**
   * Find elements by role
   */
  findAnchorElements(): TreeElement[] {
    return this.elements.filter((element) => element.isAnchor());
  }

  findParentElements(): TreeElement[] {
    return this.elements.filter((element) => element.isParent());
  }

  findChildElements(): TreeElement[] {
    return this.elements.filter((element) => element.isChild());
  }

  findChildHeaderElements(): TreeElement[] {
    return this.elements.filter((element) => element.isChildHeader());
  }

  findPeerElements(): TreeElement[] {
    return this.elements.filter((element) => element.isPeer());
  }

  /**
   * Get element at specific position
   */
  findElementAt(row: number, col: number): TreeElement | null {
    return (
      this.elements.find(
        (element) =>
          element.position.row === row && element.position.col === col
      ) || null
    );
  }

  /**
   * Check if tree is regular (down-right) or transposed (right-down)
   */
  isRegular(): boolean {
    return this.orientation === "regular";
  }

  /**
   * Check if tree is transposed (right-down)
   */
  isTransposed(): boolean {
    return this.orientation === "transposed";
  }

  /**
   * Get the maximum depth of the tree
   */
  getMaxDepth(): number {
    return Math.max(...this.elements.map((element) => element.level));
  }

  /**
   * Get elements at a specific level
   */
  getElementsAtLevel(level: number): TreeElement[] {
    return this.elements.filter((element) => element.level === level);
  }

  /**
   * Get children of a specific element
   */
  getChildren(element: TreeElement): TreeElement[] {
    return element.children || [];
  }

  /**
   * Get parent of a specific element
   */
  getParent(element: TreeElement): TreeElement | null {
    return element.parent || null;
  }

  /**
   * Get siblings of a specific element (elements at same level with same parent)
   */
  getSiblings(element: TreeElement): TreeElement[] {
    if (!element.parent) {
      // Root level siblings
      return this.elements.filter(
        (el) => el.level === element.level && el !== element
      );
    }
    return element.parent.children.filter((child) => child !== element);
  }

  /**
   * Get all descendants of an element (children, grandchildren, etc.)
   */
  getDescendants(element: TreeElement): TreeElement[] {
    const descendants: TreeElement[] = [];
    const collectDescendants = (el: TreeElement) => {
      for (const child of el.children) {
        descendants.push(child);
        collectDescendants(child);
      }
    };
    collectDescendants(element);
    return descendants;
  }

  /**
   * Get all ancestors of an element (parent, grandparent, etc.)
   */
  getAncestors(element: TreeElement): TreeElement[] {
    const ancestors: TreeElement[] = [];
    let current = element.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    return ancestors;
  }

  /**
   * Get path from root to element
   */
  getPathToElement(element: TreeElement): TreeElement[] {
    const path = this.getAncestors(element);
    path.reverse(); // Root first
    path.push(element); // Add the element itself
    return path;
  }

  /**
   * Get element content at position (convenience method)
   */
  getElementContent(row: number, col: number): string {
    const element = this.findElementAt(row, col);
    return element ? element.content : "";
  }

  /**
   * Get elements by role
   */
  getElementsByRole(role: string): TreeElement[] {
    return this.elements.filter((element) => {
      const roles = [];
      if (element.isAnchor?.()) roles.push("anchor");
      if (element.isParent?.()) roles.push("parent");
      if (element.isChild?.()) roles.push("child");
      if (element.isChildHeader?.()) roles.push("child-header");
      if (element.isPeer?.()) roles.push("peer");
      return roles.includes(role);
    });
  }

  /**
   * Get all positions in the tree
   */
  getAllPositions(): Array<{ row: number; col: number }> {
    return this.elements.map((element) => element.position);
  }

  /**
   * Check if position is within tree bounds
   */
  containsPosition(row: number, col: number): boolean {
    return (
      row >= this.bounds.topRow &&
      row <= this.bounds.bottomRow &&
      col >= this.bounds.leftCol &&
      col <= this.bounds.rightCol
    );
  }

  /**
   * Find root elements (level 0)
   */
  getRootElements(): TreeElement[] {
    return this.getElementsAtLevel(0);
  }

  /**
   * Find leaf elements (elements with no children)
   */
  getLeafElements(): TreeElement[] {
    return this.elements.filter((element) => element.children.length === 0);
  }

  /**
   * Get depth of a specific element (distance from root)
   */
  getElementDepth(element: TreeElement): number {
    return element.level;
  }

  /**
   * Get height of a specific element (distance to deepest descendant)
   */
  getElementHeight(element: TreeElement): number {
    if (element.children.length === 0) {
      return 0;
    }
    return (
      1 +
      Math.max(...element.children.map((child) => this.getElementHeight(child)))
    );
  }

  /**
   * Check if one element is ancestor of another
   */
  isAncestorOf(ancestor: TreeElement, descendant: TreeElement): boolean {
    return this.getAncestors(descendant).includes(ancestor);
  }

  /**
   * Check if one element is descendant of another
   */
  isDescendantOf(descendant: TreeElement, ancestor: TreeElement): boolean {
    return this.isAncestorOf(ancestor, descendant);
  }

  /**
   * Get next sibling of an element
   */
  getNextSibling(element: TreeElement): TreeElement | null {
    const siblings = this.getSiblings(element);
    const currentIndex = siblings.findIndex(
      (sibling) =>
        sibling.position.row === element.position.row &&
        sibling.position.col === element.position.col
    );
    return currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;
  }

  /**
   * Get previous sibling of an element
   */
  getPreviousSibling(element: TreeElement): TreeElement | null {
    const siblings = this.getSiblings(element);
    const currentIndex = siblings.findIndex(
      (sibling) =>
        sibling.position.row === element.position.row &&
        sibling.position.col === element.position.col
    );
    return currentIndex > 0 ? siblings[currentIndex - 1] : null;
  }

  /**
   * Get all parent elements that have domain regions
   */
  getParentsWithDomains(): TreeElement[] {
    return this.parentElements.filter(
      (parent) => parent.domainRegion !== undefined
    );
  }

  /**
   * Get all parent elements that have successfully parsed nested constructs
   */
  getParentsWithNestedConstructs(): TreeElement[] {
    return this.parentElements.filter(
      (parent) =>
        parent.domainRegion?.nestedConstructInstance !== undefined &&
        parent.domainRegion?.parsedSuccessfully === true
    );
  }

  /**
   * Get nested construct for a specific parent element
   */
  getNestedConstruct(parentElement: TreeElement): BaseConstruct | null {
    return parentElement.domainRegion?.nestedConstructInstance || null;
  }

  /**
   * Get summary of all nested constructs in this tree
   */
  getNestedConstructsSummary(): { [constructType: string]: number } {
    const summary: { [constructType: string]: number } = {};

    for (const parent of this.parentElements) {
      if (
        parent.domainRegion?.nestedConstruct &&
        parent.domainRegion?.parsedSuccessfully
      ) {
        const type = parent.domainRegion.nestedConstruct;
        summary[type] = (summary[type] || 0) + 1;
      }
    }

    return summary;
  }

  /**
   * Check if any parent has nested constructs
   */
  hasNestedConstructs(): boolean {
    return this.getParentsWithNestedConstructs().length > 0;
  }

  /**
   * Create a tree element with role-based methods
   */
  static createElement(
    position: { row: number; col: number },
    content: string,
    level: number,
    parent?: TreeElement,
    tree?: CoreTree,
    allFilledPoints?: Array<{ row: number; col: number }>
  ): TreeElement {
    const element: TreeElement = {
      position,
      content,
      level,
      parent,
      children: [],
      peers: [],
      valueElements: [],
      domainConstructType: null,
      childConstructs: [],

      // Role-based methods
      isAnchor(): boolean {
        // Anchor is the first element at level 0 (root level)
        // Only one element can be the anchor
        if (this.level !== 0) return false;

        if (!tree) return this.level === 0;

        // Find the first element at level 0 in tree order
        const level0Elements = tree.elements.filter((el) => el.level === 0);
        if (level0Elements.length === 0) return false;

        // Sort by position (top-to-bottom, left-to-right) and take the first
        level0Elements.sort((a, b) => {
          if (a.position.row !== b.position.row) {
            return a.position.row - b.position.row;
          }
          return a.position.col - b.position.col;
        });

        return level0Elements[0] === this;
      },

      isParent(): boolean {
        // An element is a parent if it has children
        return this.children.length > 0;
      },

      isChild(): boolean {
        // An element is a child if it has a parent (level > 0)
        return this.level > 0;
      },

      isChildHeader(): boolean {
        // Child headers are elements that label a group of children
        // Regular: same row as parent, different column (to the right)
        // Transposed: same column as parent, different row (below parent)
        if (!tree || !this.parent) {
          return false;
        }

        // Check spatial position relative to parent
        const isSameRowAsParent =
          this.position.row === this.parent.position.row;
        const isSameColAsParent =
          this.position.col === this.parent.position.col;

        if (tree.orientation === "regular") {
          // Regular orientation: child headers are same row as parent, different column (to the right)
          if (
            !isSameRowAsParent ||
            this.position.col <= this.parent.position.col
          ) {
            return false;
          }
        } else {
          // Transposed orientation: child headers are same column as parent, different row (below parent)
          if (
            !isSameColAsParent ||
            this.position.row <= this.parent.position.row
          ) {
            return false;
          }
        }

        // Check if this element has children
        if (this.children.length > 0) {
          return true;
        }

        // If element has value elements but no children, it's a key, not a child header
        if (this.valueElements && this.valueElements.length > 0) {
          return false;
        }

        // Check if there are other elements with the same parent positioned below/to the right
        return tree.elements.some(
          (el) =>
            el.parent === this.parent &&
            el !== this &&
            ((tree.orientation === "regular" &&
              el.position.row > this.position.row &&
              el.position.col === this.position.col) ||
              (tree.orientation === "transposed" &&
                el.position.col > this.position.col &&
                el.position.row === this.position.row))
        );
      },

      isPeer(): boolean {
        // Anchor elements should never have peers
        if (this.isAnchor()) return false;

        // Elements at the same level that share the same parent
        return this.peers.length > 0;
      },

      isKey(): boolean {
        // An element is a key if it has valueElements but no children
        return (
          this.valueElements &&
          this.valueElements.length > 0 &&
          this.children.length === 0
        );
      },

      isKeyValue(): boolean {
        // An element is a key value if it's part of another element's valueElements
        if (!tree) return false;

        return tree.elements.some(
          (el) => el.valueElements && el.valueElements.includes(this)
        );
      },

      hasMatrixConstruct(): boolean {
        return this.domainConstructType === "matrix";
      },

      hasTableConstruct(): boolean {
        return this.domainConstructType === "table";
      },

      hasKeyValueConstruct(): boolean {
        return this.domainConstructType === "key-value";
      },

      getDomainConstructType():
        | "matrix"
        | "table"
        | "key-value"
        | "children"
        | null {
        return this.domainConstructType || null;
      },
    };

    // Populate items array for anchor and childHeader elements
    if (tree && allFilledPoints) {
      // For anchor elements, add all elements in the first column as items
      if (element.isAnchor()) {
        const firstCol = tree.bounds.leftCol;
        element.items = tree.elements.filter(
          (el) => el.position.col === firstCol && el !== element
        );
      }

      // For childHeader elements, add child cells directly to their left (regular) or above (transposed)
      if (element.isChildHeader()) {
        element.items = tree.elements.filter((el) => {
          if (tree.orientation === "regular") {
            // Regular: items are directly below the childHeader
            return (
              el.position.col === element.position.col &&
              el.position.row > element.position.row
            );
          } else {
            // Transposed: items are directly to the right of the childHeader
            return (
              el.position.row === element.position.row &&
              el.position.col > element.position.col
            );
          }
        });
      }
    }

    return element;
  }

  /**
   * Get elements for console navigation (BaseConstruct interface)
   */
  get baseElements(): BaseElement[] {
    return this.elements.map((element) => {
      // Map TreeElement to BaseElement
      const roles = [];
      if (element.isAnchor?.()) roles.push("anchor");
      if (element.isParent?.()) roles.push("parent");
      if (element.isChild?.()) roles.push("child");
      if (element.isChildHeader?.()) roles.push("child-header");
      if (element.isPeer?.()) roles.push("peer");

      return {
        position: element.position,
        content: element.content,
        cellType: roles.join(",") || "node", // Join multiple roles or default to 'node'
      };
    });
  }

  /**
   * Check if a domain region matches the key-value pattern (binary key 9)
   * Key-value pattern: R1C1 filled, R1C2 empty, R2C1 empty, R2C2 filled (1001 binary = 9)
   */
  private checkKeyValuePattern(
    domain: {
      topRow: number;
      bottomRow: number;
      leftCol: number;
      rightCol: number;
    },
    grid: GridModel
  ): boolean {
    // Key-value pattern requires at least 2x2 region
    if (
      domain.bottomRow - domain.topRow < 1 ||
      domain.rightCol - domain.leftCol < 1
    ) {
      return false;
    }

    // Check the 2x2 pattern starting from domain top-left
    const r1c1Row = domain.topRow;
    const r1c1Col = domain.leftCol;

    const r1c1Content = grid.getCellRaw(r1c1Row, r1c1Col);
    const r1c2Content = grid.getCellRaw(r1c1Row, r1c1Col + 1);
    const r2c1Content = grid.getCellRaw(r1c1Row + 1, r1c1Col);
    const r2c2Content = grid.getCellRaw(r1c1Row + 1, r1c1Col + 1);

    // Check for binary key 9 pattern (1001)
    const r1c1Filled = r1c1Content && r1c1Content.trim() !== "";
    const r1c2Empty = !r1c2Content || r1c2Content.trim() === "";
    const r2c1Empty = !r2c1Content || r2c1Content.trim() === "";
    const r2c2Filled = r2c2Content && r2c2Content.trim() !== "";

    return r1c1Filled && r1c2Empty && r2c1Empty && r2c2Filled;
  }
}
