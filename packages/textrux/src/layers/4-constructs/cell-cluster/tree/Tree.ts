import {
  BaseConstruct,
  DirectionalOrientation,
  ConstructPosition,
} from "../../interfaces/ConstructInterfaces";

/**
 * Element types for tree components and nested constructs
 */
export enum TreeElementType {
  // Tree structure elements
  Header = "header",
  Root = "root", 
  Parent = "parent",
  Child = "child",
  Peer = "peer",
  Leaf = "leaf",
  
  // Matrix elements (when nested in tree)
  MatrixPrimaryHeader = "matrixPrimaryHeader",
  MatrixSecondaryHeader = "matrixSecondaryHeader", 
  MatrixBodyCell = "matrixBodyCell",
  MatrixSecondaryLine = "matrixSecondaryLine",
  
  // Table elements (when nested in tree)
  TableHeaderCell = "tableHeaderCell",
  TableBodyCell = "tableBodyCell",
  
  // Key-Value elements (when nested in tree)
  Key = "key",
  Value = "value"
}

/**
 * Domain region for parent nodes - rectangular area containing all descendants
 */
export interface DomainRegion {
  /** Starting row (immediate right/below parent for non-transposed/transposed trees) */
  topRow: number;
  
  /** Ending row (last descendant row) */
  bottomRow: number;
  
  /** Starting column */
  leftCol: number;
  
  /** Ending column (rightmost filled cell of any descendant) */
  rightCol: number;
  
  /** Whether this
   *  region contains nested constructs */
  hasNestedConstructs: boolean;
  
  /** Types of nested constructs found in this domain */
  nestedConstructTypes: string[];
}

/**
 * Nested construct within a tree node's domain
 */
export interface NestedConstruct {
  /** Type of nested construct */
  type: "table" | "matrix" | "key-value";
  
  /** Confidence score for this construct identification */
  confidence: number;
  
  /** Bounding region of the nested construct */
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  
  /** Elements that comprise this nested construct */
  elements: TreeElement[];
  
  /** Additional metadata specific to construct type */
  metadata: Record<string, any>;
}

/**
 * Enhanced tree element with comprehensive role and region tracking
 */
export interface TreeElement {
  /** Position of this element in the grid */
  position: ConstructPosition;
  
  /** Content of this element */
  content: string;
  
  /** Primary element type */
  elementType: TreeElementType;
  
  /** Secondary element types (for multi-role elements) */
  secondaryTypes: TreeElementType[];
  
  /** Tree hierarchy level (0 = root) */
  level: number;
  
  /** Parent element (null for root/header) */
  parent: TreeElement | null;
  
  /** Child elements */
  children: TreeElement[];
  
  /** Peer elements (same hierarchical level) */
  peers: TreeElement[];
  
  /** Whether this is a leaf element */
  isLeaf: boolean;
  
  /** Indentation amount for this element */
  indentation: number;
  
  /** Domain region for parent elements (area containing all descendants) */
  domainRegion?: DomainRegion;
  
  /** Nested constructs within this element's domain */
  nestedConstructs: NestedConstruct[];
  
  /** Role within nested construct (if part of table/matrix/key-value) */
  nestedRole?: {
    constructType: "table" | "matrix" | "key-value";
    role: string; // e.g., "header", "data", "key", "value", "primaryHeader", "bodyCell"
    parentElement: TreeElement; // The tree element that contains this nested construct
  };
  
  /** Additional metadata for this element */
  metadata: Record<string, any>;
}

/**
 * Represents a node in the tree structure (legacy interface for compatibility)
 */
export interface TreeNode {
  /** Position of this node in the grid */
  position: ConstructPosition;

  /** Content of this node */
  content: string;

  /** Level/depth in the tree (0 = root) */
  level: number;

  /** Parent node (null for root) */
  parent: TreeNode | null;

  /** Child nodes */
  children: TreeNode[];

  /** Whether this is a leaf node */
  isLeaf: boolean;

  /** Indentation amount for this node */
  indentation: number;
}

/**
 * Tree construct representing hierarchical data structures
 */
export default class Tree implements BaseConstruct {
  id: string;
  type: string = "tree";
  confidence: number;
  signatureImprint: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  /** Directional orientation of the tree */
  orientation: DirectionalOrientation;

  /** Root elements of the tree (there may be multiple) */
  rootElements: TreeElement[];

  /** All elements in the tree, organized by level */
  elementsByLevel: Map<number, TreeElement[]>;

  /** All elements indexed by position for fast lookup */
  elementsByPosition: Map<string, TreeElement>;

  /** Maximum depth of the tree */
  maxDepth: number;

  /** Whether the tree uses consistent indentation */
  hasConsistentIndentation: boolean;

  /** Whether the tree has visual connectors (lines, bullets, etc.) */
  hasVisualConnectors: boolean;

  /** Pattern used for indentation (spaces, tabs, bullets, etc.) */
  indentationPattern: string;

  constructor(
    id: string,
    confidence: number,
    signatureImprint: string,
    bounds: any,
    orientation: DirectionalOrientation,
    metadata: Record<string, any> = {}
  ) {
    this.id = id;
    this.confidence = confidence;
    this.signatureImprint = signatureImprint;
    this.bounds = bounds;
    this.orientation = orientation;
    this.metadata = metadata;

    this.rootElements = [];
    this.elementsByLevel = new Map();
    this.elementsByPosition = new Map();
    this.maxDepth = 0;
    this.hasConsistentIndentation = false;
    this.hasVisualConnectors = false;
    this.indentationPattern = "";
  }

  /**
   * Add an element to the tree
   */
  addElement(element: TreeElement): void {
    // Add to level mapping
    if (!this.elementsByLevel.has(element.level)) {
      this.elementsByLevel.set(element.level, []);
    }
    this.elementsByLevel.get(element.level)!.push(element);

    // Add to position mapping
    const posKey = `${element.position.row},${element.position.col}`;
    this.elementsByPosition.set(posKey, element);

    // Update max depth
    this.maxDepth = Math.max(this.maxDepth, element.level);

    // Add to parent's children or to root elements
    if (element.parent) {
      element.parent.children.push(element);
    } else {
      this.rootElements.push(element);
    }

    // Calculate domain region for parent elements
    if (element.children.length > 0 || element.elementType === TreeElementType.Parent) {
      this.calculateDomainRegion(element);
    }
  }

  /**
   * Get all elements at a specific level
   */
  getElementsAtLevel(level: number): TreeElement[] {
    return this.elementsByLevel.get(level) || [];
  }

  /**
   * Get all leaf elements
   */
  getLeafElements(): TreeElement[] {
    const leafElements: TreeElement[] = [];
    this.elementsByLevel.forEach((elements) => {
      leafElements.push(...elements.filter((element) => element.isLeaf));
    });
    return leafElements;
  }

  /**
   * Find an element by its position
   */
  findElementByPosition(row: number, col: number): TreeElement | null {
    const posKey = `${row},${col}`;
    return this.elementsByPosition.get(posKey) || null;
  }

  /**
   * Get the path from root to a specific element
   */
  getPathToElement(element: TreeElement): TreeElement[] {
    const path: TreeElement[] = [];
    let current = element;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  /**
   * Analyze the tree structure and update metadata
   */
  analyzeStructure(): void {
    // Analyze indentation consistency
    this.analyzeIndentation();

    // Check for visual connectors
    this.analyzeVisualConnectors();

    // Update metadata
    this.metadata.totalElements = this.getTotalElementCount();
    this.metadata.branchingFactor = this.calculateAverageBranchingFactor();
    this.metadata.treeHeight = this.maxDepth + 1;
    this.metadata.isBalanced = this.checkIfBalanced();
  }

  private analyzeIndentation(): void {
    // Check if indentation is consistent across the tree
    let consistent = true;
    const pattern = "";

    this.elementsByLevel.forEach((elements, level) => {
      elements.forEach((element) => {
        // Analysis would go here based on the actual content
        // This is a simplified version
        if (level > 0 && element.indentation === 0) {
          consistent = false;
        }
      });
    });

    this.hasConsistentIndentation = consistent;
    this.indentationPattern = pattern;
  }

  private analyzeVisualConnectors(): void {
    // Check for visual connectors like bullets, lines, arrows, etc.
    let hasConnectors = false;

    this.elementsByLevel.forEach((elements) => {
      elements.forEach((element) => {
        const content = element.content.trim();
        if (
          content.match(/^[•◦▪▫▸▹→-]/) ||
          content.includes("├") ||
          content.includes("└")
        ) {
          hasConnectors = true;
        }
      });
    });

    this.hasVisualConnectors = hasConnectors;
  }

  private getTotalElementCount(): number {
    let count = 0;
    this.elementsByLevel.forEach((elements) => (count += elements.length));
    return count;
  }

  private calculateAverageBranchingFactor(): number {
    let totalChildren = 0;
    let parentCount = 0;

    this.elementsByLevel.forEach((elements) => {
      elements.forEach((element) => {
        if (element.children.length > 0) {
          totalChildren += element.children.length;
          parentCount++;
        }
      });
    });

    return parentCount > 0 ? totalChildren / parentCount : 0;
  }

  private checkIfBalanced(): boolean {
    // Simple check - a tree is roughly balanced if the depth difference
    // between leaf elements is not too large
    const leafDepths = this.getLeafElements().map((element) => element.level);
    if (leafDepths.length === 0) return true;

    const minDepth = Math.min(...leafDepths);
    const maxDepth = Math.max(...leafDepths);

    return maxDepth - minDepth <= 1;
  }

  /**
   * Calculate domain region for a parent element
   */
  private calculateDomainRegion(element: TreeElement): void {
    if (element.children.length === 0) {
      return;
    }

    // Get all descendant positions (children and their descendants)
    const descendants = this.getAllDescendants(element);
    if (descendants.length === 0) {
      return;
    }

    const positions = descendants.map(d => d.position);
    const minRow = Math.min(...positions.map(p => p.row));
    const maxRow = Math.max(...positions.map(p => p.row));
    const minCol = Math.min(...positions.map(p => p.col));
    const maxCol = Math.max(...positions.map(p => p.col));

    // For trees, domain starts from immediate child position
    const startRow = this.orientation.primary === "vertical" ? element.position.row + 1 : minRow;
    const startCol = this.orientation.primary === "horizontal" ? element.position.col + 1 : minCol;

    element.domainRegion = {
      topRow: startRow,
      bottomRow: maxRow,
      leftCol: startCol,
      rightCol: maxCol,
      hasNestedConstructs: element.nestedConstructs.length > 0,
      nestedConstructTypes: element.nestedConstructs.map(nc => nc.type)
    };
  }

  /**
   * Get all descendants of an element
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
   * Add a nested construct to an element's domain
   */
  addNestedConstruct(parentElement: TreeElement, construct: NestedConstruct): void {
    parentElement.nestedConstructs.push(construct);
    
    // Update domain region to include nested constructs
    if (parentElement.domainRegion) {
      parentElement.domainRegion.hasNestedConstructs = true;
      if (!parentElement.domainRegion.nestedConstructTypes.includes(construct.type)) {
        parentElement.domainRegion.nestedConstructTypes.push(construct.type);
      }
    }
  }

  /**
   * Find elements by their type
   */
  findElementsByType(elementType: TreeElementType): TreeElement[] {
    const results: TreeElement[] = [];
    
    this.elementsByLevel.forEach((elements) => {
      elements.forEach((element) => {
        if (element.elementType === elementType || 
            element.secondaryTypes.includes(elementType)) {
          results.push(element);
        }
      });
    });
    
    return results;
  }

  /**
   * Find elements with nested constructs
   */
  findElementsWithNestedConstructs(constructType?: string): TreeElement[] {
    const results: TreeElement[] = [];
    
    this.elementsByLevel.forEach((elements) => {
      elements.forEach((element) => {
        if (element.nestedConstructs.length > 0) {
          if (!constructType || element.nestedConstructs.some(nc => nc.type === constructType)) {
            results.push(element);
          }
        }
      });
    });
    
    return results;
  }

  /**
   * Get the root elements that serve as headers
   */
  getHeaderElements(): TreeElement[] {
    return this.rootElements.filter(element => 
      element.elementType === TreeElementType.Header
    );
  }

  /**
   * Get all parent elements (elements with children)
   */
  getParentElements(): TreeElement[] {
    const parents: TreeElement[] = [];
    
    this.elementsByLevel.forEach((elements) => {
      elements.forEach((element) => {
        if (element.children.length > 0) {
          parents.push(element);
        }
      });
    });
    
    return parents;
  }

  /**
   * Create a new tree element
   */
  static createTreeElement(
    position: ConstructPosition,
    content: string,
    elementType: TreeElementType,
    level: number,
    parent: TreeElement | null = null
  ): TreeElement {
    return {
      position,
      content,
      elementType,
      secondaryTypes: [],
      level,
      parent,
      children: [],
      peers: [],
      isLeaf: true, // Will be updated when children are added
      indentation: parent ? parent.indentation + 1 : 0,
      nestedConstructs: [],
      metadata: {}
    };
  }
}
