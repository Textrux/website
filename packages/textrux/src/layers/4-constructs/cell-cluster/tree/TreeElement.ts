import {
  HierarchicalElement,
  ConstructPosition,
} from "../../interfaces/ConstructElementInterfaces";
import { CellFormat } from "../../../../style/CellFormat";

/**
 * Tree node element implementation
 */
export class TreeNodeElement implements HierarchicalElement {
  id: string;
  type: string = "tree-node";
  position: ConstructPosition;
  content: string;
  role: string;
  format?: CellFormat;
  interactive: boolean = true;
  metadata: Record<string, any>;

  // Selectable properties
  selected: boolean = false;
  selectionPriority: number = 10;

  // Hierarchical properties
  level: number;
  parentId: string | null;
  childIds: string[] = [];
  canHaveChildren: boolean = true;

  constructor(
    id: string,
    position: ConstructPosition,
    content: string,
    level: number,
    parentId: string | null = null,
    role: string = "node"
  ) {
    this.id = id;
    this.position = position;
    this.content = content;
    this.level = level;
    this.parentId = parentId;
    this.role = role;
    this.metadata = {};

    // Set higher priority for root nodes
    if (level === 0) {
      this.selectionPriority = 20;
      this.role = "root";
    }
  }

  /**
   * Add a child node ID
   */
  addChild(childId: string): void {
    if (!this.childIds.includes(childId)) {
      this.childIds.push(childId);
    }
  }

  /**
   * Remove a child node ID
   */
  removeChild(childId: string): void {
    const index = this.childIds.indexOf(childId);
    if (index >= 0) {
      this.childIds.splice(index, 1);
    }
  }

  /**
   * Check if this node is a leaf
   */
  isLeaf(): boolean {
    return this.childIds.length === 0;
  }

  /**
   * Check if this node is a root
   */
  isRoot(): boolean {
    return this.parentId === null;
  }

  /**
   * Get the indentation level for display
   */
  getIndentationLevel(): number {
    return this.level;
  }

  /**
   * Clone this element
   */
  clone(): TreeNodeElement {
    const cloned = new TreeNodeElement(
      this.id,
      { ...this.position },
      this.content,
      this.level,
      this.parentId,
      this.role
    );

    cloned.selected = this.selected;
    cloned.selectionPriority = this.selectionPriority;
    cloned.childIds = [...this.childIds];
    cloned.canHaveChildren = this.canHaveChildren;
    cloned.interactive = this.interactive;
    cloned.format = this.format;
    cloned.metadata = { ...this.metadata };

    return cloned;
  }
}

/**
 * Tree connector element for visual connectors between nodes
 */
export class TreeConnectorElement implements HierarchicalElement {
  id: string;
  type: string = "tree-connector";
  position: ConstructPosition;
  content: string;
  role: string = "connector";
  format?: CellFormat;
  interactive: boolean = false;
  metadata: Record<string, any>;

  // Selectable properties
  selected: boolean = false;
  selectionPriority: number = 1; // Low priority for connectors

  // Hierarchical properties
  level: number;
  parentId: string | null;
  childIds: string[] = [];
  canHaveChildren: boolean = false;

  constructor(
    id: string,
    position: ConstructPosition,
    content: string,
    level: number,
    parentId: string | null = null
  ) {
    this.id = id;
    this.position = position;
    this.content = content;
    this.level = level;
    this.parentId = parentId;
    this.metadata = {};
  }

  /**
   * Add a child (not supported for connectors)
   */
  addChild(childId: string): void {
    // Connectors don't have children
  }

  /**
   * Remove a child (not supported for connectors)
   */
  removeChild(childId: string): void {
    // Connectors don't have children
  }

  /**
   * Clone this element
   */
  clone(): TreeConnectorElement {
    const cloned = new TreeConnectorElement(
      this.id,
      { ...this.position },
      this.content,
      this.level,
      this.parentId
    );

    cloned.selected = this.selected;
    cloned.selectionPriority = this.selectionPriority;
    cloned.interactive = this.interactive;
    cloned.format = this.format;
    cloned.metadata = { ...this.metadata };

    return cloned;
  }
}
