import { CellFormat } from "../../../style/CellFormat";
import { ConstructPosition } from "./ConstructInterfaces";

/**
 * Base interface for construct elements
 */
export interface ConstructElement {
  /** Unique identifier for this element within the construct */
  id: string;

  /** Type of element (e.g., "tree-node", "table-header", "matrix-cell") */
  type: string;

  /** Position of this element in the grid */
  position: ConstructPosition;

  /** Content of this element */
  content: string;

  /** Role/semantics of this element within the construct */
  role: string;

  /** Custom formatting for this specific element */
  format?: CellFormat;

  /** Whether this element can be interacted with */
  interactive: boolean;

  /** Metadata specific to this element */
  metadata: Record<string, any>;
}

/**
 * Interface for elements that can be selected
 */
export interface SelectableElement extends ConstructElement {
  /** Whether this element is currently selected */
  selected: boolean;

  /** Selection priority (higher = more important when multiple selections) */
  selectionPriority: number;
}

/**
 * Interface for hierarchical elements (like tree nodes)
 */
export interface HierarchicalElement extends SelectableElement {
  /** Level in the hierarchy (0 = root) */
  level: number;

  /** Parent element ID (null for root) */
  parentId: string | null;

  /** Child element IDs */
  childIds: string[];

  /** Whether this element can have children */
  canHaveChildren: boolean;
}

/**
 * Interface for tabular elements (like table cells)
 */
export interface TabularElement extends SelectableElement {
  /** Row index within the table */
  rowIndex: number;

  /** Column index within the table */
  columnIndex: number;

  /** Column span */
  colSpan?: number;

  /** Row span */
  rowSpan?: number;

  /** Whether this is a header cell */
  isHeader: boolean;
}

/**
 * Element formatting provider - generates format based on element properties
 */
export interface ElementFormatProvider {
  /** Get format for a specific element */
  getElementFormat(element: ConstructElement): CellFormat;

  /** Get format for a specific element type and role */
  getFormatForTypeAndRole(type: string, role: string): CellFormat;

  /** Get format for element state (selected, focused, etc.) */
  getStateFormat(element: ConstructElement, state: ElementState): CellFormat;
}

/**
 * Element state for formatting
 */
export interface ElementState {
  selected: boolean;
  focused: boolean;
  hovered: boolean;
  disabled: boolean;
  [key: string]: any;
}

/**
 * Interface for construct element containers
 */
export interface ConstructElementContainer {
  /** All elements in this construct */
  elements: Map<string, ConstructElement>;

  /** Get element by ID */
  getElement(id: string): ConstructElement | undefined;

  /** Get elements by type */
  getElementsByType(type: string): ConstructElement[];

  /** Get elements by role */
  getElementsByRole(role: string): ConstructElement[];

  /** Add an element */
  addElement(element: ConstructElement): void;

  /** Remove an element */
  removeElement(id: string): boolean;

  /** Get all element positions */
  getAllPositions(): ConstructPosition[];

  /** Find element at a specific position */
  getElementAtPosition(row: number, col: number): ConstructElement | undefined;
}
