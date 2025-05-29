import {
  BaseConstruct,
  DirectionalOrientation,
  ConstructPosition,
} from "../../interfaces/ConstructInterfaces";

/**
 * Represents a node in the tree structure
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

  /** Root nodes of the tree (there may be multiple) */
  rootNodes: TreeNode[];

  /** All nodes in the tree, organized by level */
  nodesByLevel: Map<number, TreeNode[]>;

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

    this.rootNodes = [];
    this.nodesByLevel = new Map();
    this.maxDepth = 0;
    this.hasConsistentIndentation = false;
    this.hasVisualConnectors = false;
    this.indentationPattern = "";
  }

  /**
   * Add a node to the tree
   */
  addNode(node: TreeNode): void {
    // Add to level mapping
    if (!this.nodesByLevel.has(node.level)) {
      this.nodesByLevel.set(node.level, []);
    }
    this.nodesByLevel.get(node.level)!.push(node);

    // Update max depth
    this.maxDepth = Math.max(this.maxDepth, node.level);

    // Add to parent's children or to root nodes
    if (node.parent) {
      node.parent.children.push(node);
    } else {
      this.rootNodes.push(node);
    }
  }

  /**
   * Get all nodes at a specific level
   */
  getNodesAtLevel(level: number): TreeNode[] {
    return this.nodesByLevel.get(level) || [];
  }

  /**
   * Get all leaf nodes
   */
  getLeafNodes(): TreeNode[] {
    const leafNodes: TreeNode[] = [];
    this.nodesByLevel.forEach((nodes) => {
      leafNodes.push(...nodes.filter((node) => node.isLeaf));
    });
    return leafNodes;
  }

  /**
   * Find a node by its position
   */
  findNodeByPosition(row: number, col: number): TreeNode | null {
    for (const nodes of this.nodesByLevel.values()) {
      const node = nodes.find(
        (n) => n.position.row === row && n.position.col === col
      );
      if (node) return node;
    }
    return null;
  }

  /**
   * Get the path from root to a specific node
   */
  getPathToNode(node: TreeNode): TreeNode[] {
    const path: TreeNode[] = [];
    let current = node;

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
    this.metadata.totalNodes = this.getTotalNodeCount();
    this.metadata.branchingFactor = this.calculateAverageBranchingFactor();
    this.metadata.treeHeight = this.maxDepth + 1;
    this.metadata.isBalanced = this.checkIfBalanced();
  }

  private analyzeIndentation(): void {
    // Check if indentation is consistent across the tree
    let consistent = true;
    const pattern = "";

    this.nodesByLevel.forEach((nodes, level) => {
      nodes.forEach((node) => {
        // Analysis would go here based on the actual content
        // This is a simplified version
        if (level > 0 && node.indentation === 0) {
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

    this.nodesByLevel.forEach((nodes) => {
      nodes.forEach((node) => {
        const content = node.content.trim();
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

  private getTotalNodeCount(): number {
    let count = 0;
    this.nodesByLevel.forEach((nodes) => (count += nodes.length));
    return count;
  }

  private calculateAverageBranchingFactor(): number {
    let totalChildren = 0;
    let parentCount = 0;

    this.nodesByLevel.forEach((nodes) => {
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          totalChildren += node.children.length;
          parentCount++;
        }
      });
    });

    return parentCount > 0 ? totalChildren / parentCount : 0;
  }

  private checkIfBalanced(): boolean {
    // Simple check - a tree is roughly balanced if the depth difference
    // between leaf nodes is not too large
    const leafDepths = this.getLeafNodes().map((node) => node.level);
    if (leafDepths.length === 0) return true;

    const minDepth = Math.min(...leafDepths);
    const maxDepth = Math.max(...leafDepths);

    return maxDepth - minDepth <= 1;
  }
}
