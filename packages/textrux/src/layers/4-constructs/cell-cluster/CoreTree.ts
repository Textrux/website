import { BaseConstruct } from "../interfaces/ConstructInterfaces";
import GridModel from "../../1-substrate/GridModel";
import CellCluster from "../../3-foundation/cell-cluster/CellCluster";

/**
 * Core Tree construct based on Cell Cluster Key system
 * Replaces the over-engineered Tree.ts with elegant simplicity
 */

export type TreeElementType = "anchor" | "parent" | "child" | "peer";
export type TreeOrientation = "regular" | "transposed";

export interface TreeElement {
  position: { row: number; col: number };
  content: string;
  elementType: TreeElementType;
  level: number;
  parent?: TreeElement;
  children: TreeElement[];
  peers: TreeElement[];
  domainRegion?: DomainRegion;
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
  peerElements: TreeElement[];

  constructor(
    id: string,
    keyPattern: string,
    bounds: { topRow: number; bottomRow: number; leftCol: number; rightCol: number },
    orientation: TreeOrientation = "regular"
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
    this.bounds = bounds;
    this.orientation = orientation;
    this.elements = [];
    this.parentElements = [];
    this.childElements = [];
    this.peerElements = [];
    this.metadata = {};
  }

  /**
   * Add an element to the tree
   */
  addElement(element: TreeElement): void {
    this.elements.push(element);
    
    // Categorize element by type
    switch (element.elementType) {
      case "anchor":
        this.anchorElement = element;
        break;
      case "parent":
        this.parentElements.push(element);
        break;
      case "child":
        this.childElements.push(element);
        break;
      case "peer":
        this.peerElements.push(element);
        break;
    }
  }

  /**
   * Calculate domain region for a parent element
   * Domain is the rectangular area containing all descendants
   */
  calculateDomainRegion(parentElement: TreeElement): DomainRegion {
    if (parentElement.children.length === 0) {
      // No children, domain is just the parent cell
      return {
        topRow: parentElement.position.row,
        bottomRow: parentElement.position.row,
        leftCol: parentElement.position.col,
        rightCol: parentElement.position.col
      };
    }

    // Find bounding box of all descendants
    const allDescendants = this.getAllDescendants(parentElement);
    const positions = allDescendants.map(d => d.position);
    
    const minRow = Math.min(...positions.map(p => p.row));
    const maxRow = Math.max(...positions.map(p => p.row));
    const minCol = Math.min(...positions.map(p => p.col));
    const maxCol = Math.max(...positions.map(p => p.col));

    const domain: DomainRegion = {
      topRow: minRow,
      bottomRow: maxRow,
      leftCol: minCol,
      rightCol: maxCol
    };

    // Store domain in parent element
    parentElement.domainRegion = domain;
    
    return domain;
  }

  /**
   * Advanced domain calculation using next peer/ancestor algorithm
   * Finds domain boundary based on next peer or ancestor, whichever comes first
   */
  calculateAdvancedDomainRegion(parentElement: TreeElement, grid: GridModel): DomainRegion {
    // Start with parent position
    let topRow = parentElement.position.row;
    let leftCol = parentElement.position.col;
    let bottomRow = parentElement.position.row;
    let rightCol = parentElement.position.col;

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

    // Include all descendants in domain
    const allDescendants = this.getAllDescendants(parentElement);
    if (allDescendants.length > 0) {
      const descendantPositions = allDescendants.map(d => d.position);
      bottomRow = Math.max(bottomRow, ...descendantPositions.map(p => p.row));
      rightCol = Math.max(rightCol, ...descendantPositions.map(p => p.col));
    }

    const domain: DomainRegion = {
      topRow,
      bottomRow,
      leftCol,
      rightCol
    };

    // Store domain in parent element
    parentElement.domainRegion = domain;
    
    return domain;
  }

  /**
   * Find the next peer or ancestor element after the given parent
   */
  private findNextPeerOrAncestor(parentElement: TreeElement): TreeElement | null {
    const parentLevel = parentElement.level;
    const parentRow = parentElement.position.row;
    
    // Look for elements at same level or higher (lower level number) that come after this parent
    const candidates = this.elements.filter(element => 
      element.level <= parentLevel && 
      element.position.row > parentRow
    );

    // Sort by row position and return the first one
    candidates.sort((a, b) => a.position.row - b.position.row);
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Find the last filled column in a row range (for regular orientation)
   */
  private findLastFilledColumn(topRow: number, bottomRow: number, startCol: number, grid: GridModel): number {
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
  private findLastFilledRow(startRow: number, leftCol: number, rightCol: number, grid: GridModel): number {
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
  private parseNestedConstructInDomain(parentElement: TreeElement, grid: GridModel, parser: any): void {
    const domain = parentElement.domainRegion;
    if (!domain) return;

    // Create a cell cluster for the domain region
    const domainFilledPoints: Array<{ row: number; col: number }> = [];
    
    // Collect filled cells within the domain (excluding the parent cell itself)
    for (let row = domain.topRow; row <= domain.bottomRow; row++) {
      for (let col = domain.leftCol; col <= domain.rightCol; col++) {
        // Skip the parent cell
        if (row === parentElement.position.row && col === parentElement.position.col) {
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
        domain.nestedConstruct = nestedConstruct.type as "table" | "matrix" | "key-value";
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
   * Find elements by type
   */
  findElementsByType(type: TreeElementType): TreeElement[] {
    return this.elements.filter(element => element.elementType === type);
  }

  /**
   * Get element at specific position
   */
  findElementAt(row: number, col: number): TreeElement | null {
    return this.elements.find(
      element => element.position.row === row && element.position.col === col
    ) || null;
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
    return Math.max(...this.elements.map(element => element.level));
  }

  /**
   * Get elements at a specific level
   */
  getElementsAtLevel(level: number): TreeElement[] {
    return this.elements.filter(element => element.level === level);
  }

  /**
   * Get all parent elements that have domain regions
   */
  getParentsWithDomains(): TreeElement[] {
    return this.parentElements.filter(parent => parent.domainRegion !== undefined);
  }

  /**
   * Get all parent elements that have successfully parsed nested constructs
   */
  getParentsWithNestedConstructs(): TreeElement[] {
    return this.parentElements.filter(parent => 
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
      if (parent.domainRegion?.nestedConstruct && parent.domainRegion?.parsedSuccessfully) {
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
   * Create a simple tree element
   */
  static createElement(
    position: { row: number; col: number },
    content: string,
    elementType: TreeElementType,
    level: number,
    parent?: TreeElement
  ): TreeElement {
    return {
      position,
      content,
      elementType,
      level,
      parent,
      children: [],
      peers: []
    };
  }
}