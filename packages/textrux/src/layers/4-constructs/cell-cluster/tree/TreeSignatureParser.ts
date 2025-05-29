import {
  ConstructSignatureParser,
  ConstructSignature,
  DirectionalOrientation,
} from "../../interfaces/ConstructInterfaces";
import Tree, { TreeNode } from "./Tree";
import { TreeSignatures } from "./TreeSignatures";
import CellCluster from "../../../3-foundation/cell-cluster/CellCluster";

/**
 * Parser for identifying and creating Tree constructs from cell clusters
 */
export class TreeSignatureParser implements ConstructSignatureParser<Tree> {
  constructType: string = "tree";
  signatures: ConstructSignature[] = TreeSignatures;

  /**
   * Parse a cell cluster and return Tree construct instances if found
   */
  parseConstruct(cluster: CellCluster): Tree[] {
    const trees: Tree[] = [];

    if (!cluster.traits) {
      return trees;
    }

    // Try each signature to see if it matches
    for (const signature of this.signatures) {
      const confidence = this.calculateConfidence(signature, cluster.traits);

      if (confidence >= signature.minConfidence) {
        // Additional validation if specified
        if (
          signature.validate &&
          !signature.validate(cluster.traits, cluster)
        ) {
          continue;
        }

        const tree = this.createConstruct(signature, cluster, confidence);
        if (tree) {
          trees.push(tree);
        }
      }
    }

    return trees;
  }

  /**
   * Calculate confidence score for a specific signature
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
   * Create Tree construct instance from signature match
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
   * Determine the orientation of the tree based on signature and cluster traits
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
   * Build the tree structure from the cell cluster content
   */
  private buildTreeStructure(
    tree: Tree,
    cluster: CellCluster,
    signature: ConstructSignature
  ): void {
    // This is a simplified implementation - in reality, this would analyze
    // the actual cell content to determine hierarchy and relationships

    const nodes: TreeNode[] = [];

    // For vertical trees, process row by row
    if (tree.orientation.primary === "vertical") {
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
          // Check if this cell has content (would get from grid)
          // For now, create placeholder nodes
          const content = this.getCellContent(row, col); // Would get from actual grid
          if (content && content.trim()) {
            const node = this.createTreeNode(
              row,
              col,
              content,
              tree.orientation
            );
            if (node) {
              nodes.push(node);
              tree.addNode(node);
            }
          }
        }
      }
    } else {
      // For horizontal trees, process column by column
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
          const content = this.getCellContent(row, col);
          if (content && content.trim()) {
            const node = this.createTreeNode(
              row,
              col,
              content,
              tree.orientation
            );
            if (node) {
              nodes.push(node);
              tree.addNode(node);
            }
          }
        }
      }
    }

    // Determine parent-child relationships
    this.establishHierarchy(nodes, tree.orientation);
  }

  /**
   * Create a tree node from cell position and content
   */
  private createTreeNode(
    row: number,
    col: number,
    content: string,
    orientation: DirectionalOrientation
  ): TreeNode | null {
    // Analyze content to determine indentation and level
    const indentation = this.calculateIndentation(content);
    const level = Math.floor(indentation / 2); // Assume 2 spaces per level

    return {
      position: { row, col, relativeRow: 0, relativeCol: 0 },
      content: content.trim(),
      level,
      parent: null, // Will be set in establishHierarchy
      children: [],
      isLeaf: true, // Will be updated when children are added
      indentation,
    };
  }

  /**
   * Establish parent-child relationships between nodes
   */
  private establishHierarchy(
    nodes: TreeNode[],
    orientation: DirectionalOrientation
  ): void {
    // Sort nodes by position based on orientation
    if (orientation.primary === "vertical") {
      nodes.sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
      });
    } else {
      nodes.sort((a, b) => {
        if (a.position.col !== b.position.col) {
          return a.position.col - b.position.col;
        }
        return a.position.row - b.position.row;
      });
    }

    // Establish parent-child relationships based on levels
    const levelStack: TreeNode[] = [];

    for (const node of nodes) {
      // Remove nodes from stack that are at the same or higher level
      while (
        levelStack.length > 0 &&
        levelStack[levelStack.length - 1].level >= node.level
      ) {
        levelStack.pop();
      }

      // If there's a node in the stack, it's our parent
      if (levelStack.length > 0) {
        const parent = levelStack[levelStack.length - 1];
        node.parent = parent;
        parent.children.push(node);
        parent.isLeaf = false;
      }

      // Add current node to stack
      levelStack.push(node);
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
   * Get cell content (placeholder - would integrate with actual grid)
   */
  private getCellContent(row: number, col: number): string {
    // This would integrate with the actual GridModel to get cell content
    // For now, return empty string
    return "";
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
