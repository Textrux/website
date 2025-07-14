import {
  ConstructSignatureParser,
  ConstructSignature,
  DirectionalOrientation,
} from "../../interfaces/ConstructInterfaces";
import Tree, { TreeElement, TreeElementType } from "./Tree";
import { TreeSignatures } from "./TreeSignatures";
import { CellClusterTraitParser } from "../../../3-foundation/cell-cluster/CellClusterTraitParser";
import GridModel from "../../../1-substrate/GridModel";
import CellCluster from "../../../3-foundation/cell-cluster/CellCluster";

/**
 * Parser for identifying and creating Tree constructs from cell clusters using trait-based detection
 */
export class TreeSignatureParser implements ConstructSignatureParser<Tree> {
  constructType: string = "tree";
  signatures: ConstructSignature[] = TreeSignatures;
  private grid: GridModel;
  private traitParser: CellClusterTraitParser;

  constructor(grid: GridModel) {
    this.grid = grid;
    this.traitParser = new CellClusterTraitParser(grid);
  }

  /**
   * Parse a cell cluster and return Tree construct instances if found
   */
  parseConstruct(cluster: CellCluster): Tree[] {
    const trees: Tree[] = [];

    // Parse traits if not already done
    if (!cluster.traits) {
      cluster.traits = this.traitParser.parseTraits(cluster);
    }

    // Use trait-based tree detection
    if (this.isTreeByTraits(cluster.traits)) {
      const confidence = this.calculateTreeConfidence(cluster.traits);
      
      if (confidence >= 0.7) { // Minimum confidence threshold
        const tree = this.createTreeFromTraits(cluster, confidence);
        if (tree) {
          trees.push(tree);
        }
      }
    }

    return trees;
  }

  /**
   * Check if cluster traits indicate a tree structure
   */
  private isTreeByTraits(traits: any): boolean {
    const treeTraits = traits.treeDetection;
    if (!treeTraits) return false;

    // Apply user-specified tree detection constraints
    return (
      !treeTraits.allCellsFilled &&                           // false for trees
      treeTraits.filledTopLeftCell &&                         // true for trees (anchor)
      treeTraits.maxRowIndentationIncrease <= 1 &&            // ≤1 for trees
      treeTraits.maxGapSizeInAnyRow <= 1 &&                   // ≤1 for trees
      treeTraits.maxGapCountInAnyRow <= 1 &&                  // ≤1 for trees
      treeTraits.maxFilledCellsBeforeAnyRowGap <= 1 &&        // ≤1 for trees
      treeTraits.nonParentRowsWithGap === 0                   // 0 for trees
    );
  }

  /**
   * Calculate tree confidence based on traits
   */
  private calculateTreeConfidence(traits: any): number {
    let score = 0;
    let factors = 0;

    const treeTraits = traits.treeDetection;
    const constructTraits = traits.constructDetection;
    const indentationTraits = traits.indentation;

    // Core tree indicators (high weight)
    if (treeTraits.filledTopLeftCell) { score += 0.3; factors++; }
    if (!treeTraits.allCellsFilled) { score += 0.2; factors++; }
    if (constructTraits.hasTopLeftAnchor) { score += 0.2; factors++; }
    if (constructTraits.hasHierarchicalIndentation) { score += 0.2; factors++; }
    
    // Structural indicators (medium weight)
    if (indentationTraits.hasConsistentIndentation) { score += 0.1; factors++; }
    if (indentationTraits.followsTreePattern) { score += 0.15; factors++; }
    
    // Perfect constraint satisfaction (bonus)
    if (treeTraits.maxRowIndentationIncrease <= 1) { score += 0.05; factors++; }
    if (treeTraits.nonParentRowsWithGap === 0) { score += 0.05; factors++; }

    return factors > 0 ? Math.min(score, 1.0) : 0;
  }

  /**
   * Create Tree construct from trait-based detection
   */
  private createTreeFromTraits(
    cluster: CellCluster,
    confidence: number
  ): Tree {
    const treeId = `tree_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;
    
    // Determine orientation based on traits
    const orientation = this.determineOrientationFromTraits(cluster.traits);
    
    // Create the tree instance
    const tree = new Tree(
      treeId,
      confidence,
      "trait-based-tree",
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
      },
      orientation
    );

    // Build tree structure using trait-guided analysis
    this.buildTreeFromTraits(tree, cluster);
    
    // Analyze the tree structure
    tree.analyzeStructure();
    
    return tree;
  }

  /**
   * Determine orientation from traits
   */
  private determineOrientationFromTraits(traits: any): DirectionalOrientation {
    const base = traits.base;
    const indentation = traits.indentation;
    
    // Check if it's a transposed tree (right-down)
    const isTransposed = (
      traits.treeDetection.maxColumnIndentationIncrease <= 1 &&
      traits.treeDetection.maxGapSizeInAnyColumn <= 1 &&
      base.width > base.height
    );
    
    if (isTransposed) {
      return { primary: "horizontal", secondary: "vertical" }; // Transposed tree: primary right, secondary down
    } else {
      return { primary: "vertical", secondary: "horizontal" }; // Regular tree: primary down, secondary right
    }
  }

  /**
   * Build tree structure using trait-guided analysis
   */
  private buildTreeFromTraits(
    tree: Tree,
    cluster: CellCluster
  ): void {
    const elements: TreeElement[] = [];
    
    // Process cells based on tree orientation
    if (tree.orientation.primary === "vertical") {
      // Regular tree: process top to bottom, left to right
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
          const content = this.grid.getCellRaw(row, col);
          if (content && content.trim()) {
            const element = this.createTreeElementFromContent(
              row, col, content, tree.orientation
            );
            if (element) {
              elements.push(element);
            }
          }
        }
      }
    } else {
      // Transposed tree: process left to right, top to bottom
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
          const content = this.grid.getCellRaw(row, col);
          if (content && content.trim()) {
            const element = this.createTreeElementFromContent(
              row, col, content, tree.orientation
            );
            if (element) {
              elements.push(element);
            }
          }
        }
      }
    }
    
    // Establish hierarchy and add to tree
    this.establishElementHierarchy(elements, tree);
  }

  /**
   * Create a tree element from cell position and content
   */
  private createTreeElementFromContent(
    row: number,
    col: number,
    content: string,
    orientation: DirectionalOrientation
  ): TreeElement | null {
    // Analyze content to determine indentation and level
    const indentation = this.calculateIndentation(content);
    const level = Math.floor(indentation / 2); // Assume 2 spaces per level

    // Determine element type based on content and position
    const elementType = this.determineElementType(content, row, col, level);
    
    return Tree.createTreeElement(
      { row, col, relativeRow: 0, relativeCol: 0 },
      content.trim(),
      elementType,
      level
    );
  }

  /**
   * Determine element type based on content and context
   */
  private determineElementType(
    content: string,
    row: number,
    col: number,
    level: number
  ): TreeElementType {
    const trimmedContent = content.trim();
    
    // Check for header patterns
    if (level === 0 && (row === 0 || col === 0)) {
      return TreeElementType.Header;
    }
    
    // Check for root element
    if (level === 0) {
      return TreeElementType.Root;
    }
    
    // Check for parent vs leaf based on content patterns
    if (trimmedContent.endsWith(':') || 
        trimmedContent.match(/^[A-Z][^a-z]*$/)) {
      return TreeElementType.Parent;
    }
    
    // Default to child/leaf
    return TreeElementType.Child;
  }

  /**
   * Establish parent-child relationships between elements and add to tree
   */
  private establishElementHierarchy(
    elements: TreeElement[],
    tree: Tree
  ): void {
    // Sort elements by position based on orientation
    if (tree.orientation.primary === "vertical") {
      elements.sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
      });
    } else {
      elements.sort((a, b) => {
        if (a.position.col !== b.position.col) {
          return a.position.col - b.position.col;
        }
        return a.position.row - b.position.row;
      });
    }

    // Establish parent-child relationships based on levels
    const levelStack: TreeElement[] = [];

    for (const element of elements) {
      // Remove elements from stack that are at the same or higher level
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
        parent.isLeaf = false;
        
        // Update parent type if it has children
        if (parent.elementType === TreeElementType.Child) {
          parent.elementType = TreeElementType.Parent;
        }
      }

      // Add current element to stack and tree
      levelStack.push(element);
      tree.addElement(element);
    }
  }

  /**
   * Calculate indentation level from content
   */
  private calculateIndentation(content: string): number {
    const match = content.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  /**
   * Get cell content from grid
   */
  private getCellContent(row: number, col: number): string {
    return this.grid.getCellRaw(row, col);
  }

  /**
   * Calculate confidence score for a specific signature (legacy method for compatibility)
   */
  calculateConfidence(signature: ConstructSignature, traits: any): number {
    let score = 0;
    let totalWeight = 0;

    // Check required traits (must all be present)
    for (const requiredTrait of signature.requiredTraits) {
      if (!this.getTraitValue(traits, requiredTrait)) {
        return 0; // Required trait missing, confidence is 0
      }
    }

    // Calculate weighted score from optional traits
    for (const [traitPath, weight] of Object.entries(signature.traitWeights)) {
      totalWeight += weight;
      const traitValue = this.getTraitValue(traits, traitPath);

      if (traitValue) {
        // If it's a boolean trait, use full weight
        // If it's a numeric trait, use proportional weight
        if (typeof traitValue === "boolean" && traitValue) {
          score += weight;
        } else if (typeof traitValue === "number") {
          score += weight * Math.min(traitValue, 1); // Cap at 1.0
        }
      }
    }

    // Normalize score
    return totalWeight > 0 ? Math.min(score / totalWeight, 1.0) : 0;
  }

  /**
   * Create Tree construct instance from signature match (legacy method for compatibility)
   */
  createConstruct(
    signature: ConstructSignature,
    cluster: CellCluster,
    confidence: number
  ): Tree {
    const treeId = `tree_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;

    // Determine orientation based on signature
    const orientation = this.determineOrientation(signature, cluster);

    // Create the tree instance
    const tree = new Tree(
      treeId,
      confidence,
      signature.name,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
      },
      orientation
    );

    // Build the tree structure from the cell cluster
    this.buildTreeStructure(tree, cluster, signature);

    // Analyze the tree structure
    tree.analyzeStructure();

    return tree;
  }

  /**
   * Determine the orientation of the tree based on signature and cluster traits (legacy)
   */
  private determineOrientation(
    signature: ConstructSignature,
    cluster: CellCluster
  ): DirectionalOrientation {
    if (signature.name.includes("horizontal")) {
      return { primary: "horizontal", secondary: "vertical" };
    } else if (signature.name.includes("vertical")) {
      return { primary: "vertical", secondary: "horizontal" };
    }

    // Default determination based on cluster shape
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;

    if (height > width) {
      return { primary: "vertical", secondary: "horizontal" };
    } else {
      return { primary: "horizontal", secondary: "vertical" };
    }
  }

  /**
   * Build the tree structure from the cell cluster content (legacy)
   */
  private buildTreeStructure(
    tree: Tree,
    cluster: CellCluster,
    signature: ConstructSignature
  ): void {
    // Legacy implementation - delegates to trait-based approach
    this.buildTreeFromTraits(tree, cluster);
  }

  /**
   * Get trait value from nested trait object using dot notation
   */
  private getTraitValue(traits: any, traitPath: string): any {
    const parts = traitPath.split(".");
    let current = traits;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }
}