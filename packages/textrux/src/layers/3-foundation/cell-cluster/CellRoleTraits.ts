/**
 * Cell role traits for identifying specific semantic roles of cells
 * within different construct types
 */

import { CellPosition } from "./SpatialRelationshipTraits";

export enum CellRole {
  // Tree construct roles
  TreeRoot = "tree-root",
  TreeParent = "tree-parent",
  TreeChild = "tree-child",
  TreePeer = "tree-peer",
  TreeHeader = "tree-header",
  TreeLeaf = "tree-leaf",
  TreeCell = "tree-cell",
  
  // Table construct roles
  TableHeader = "table-header",
  TableData = "table-data",
  TableRowHeader = "table-row-header",
  TableColumnHeader = "table-column-header",
  TableCell = "table-cell",
  
  // Matrix construct roles
  MatrixCorner = "matrix-corner",
  MatrixPrimaryHeader = "matrix-primary-header",
  MatrixSecondaryHeader = "matrix-secondary-header",
  MatrixBody = "matrix-body",
  MatrixCell = "matrix-cell",
  
  // Key-Value construct roles
  KeyValueKey = "key-value-key",
  KeyValueValue = "key-value-value",
  KeyValuePair = "key-value-pair",
  
  // Generic roles
  Header = "header",
  Data = "data",
  Label = "label",
  Empty = "empty",
  Unknown = "unknown",
}

/**
 * Represents a cell with its assigned role and metadata
 */
export interface RoleAssignment {
  /** Position of the cell */
  position: CellPosition;
  
  /** Primary role assigned to this cell */
  role: CellRole;
  
  /** Additional roles this cell might have */
  secondaryRoles: CellRole[];
  
  /** Confidence in the role assignment (0-1) */
  confidence: number;
  
  /** Hierarchical level (for tree/hierarchy roles) */
  level?: number;
  
  /** Parent cell position (for child cells) */
  parentPosition?: CellPosition;
  
  /** Child cell positions (for parent cells) */
  childPositions?: CellPosition[];
  
  /** Peer cell positions (for peer relationships) */
  peerPositions?: CellPosition[];
  
  /** Additional metadata specific to the role */
  metadata: Record<string, any>;
}

/**
 * Tree-specific role analysis
 */
export interface TreeRoleAnalysis {
  /** Cells identified as root nodes */
  rootCells: RoleAssignment[];
  
  /** Cells identified as parent nodes */
  parentCells: RoleAssignment[];
  
  /** Cells identified as child nodes */
  childCells: RoleAssignment[];
  
  /** Cells identified as peer nodes (same level) */
  peerCells: RoleAssignment[];
  
  /** Cells identified as headers for peer groups */
  headerCells: RoleAssignment[];
  
  /** Cells identified as leaf nodes (no children) */
  leafCells: RoleAssignment[];
  
  /** All cells that are part of the tree structure */
  treeCells: RoleAssignment[];
  
  /** Hierarchical structure organized by level */
  hierarchy: Map<number, RoleAssignment[]>;
  
  /** Parent-child relationships */
  parentChildMappings: Map<string, string[]>; // parent position -> child positions
  
  /** Peer groups (cells at same hierarchical level) */
  peerGroups: RoleAssignment[][];
  
  /** Maximum depth of the tree */
  maxDepth: number;
  
  /** Whether the tree has consistent structure */
  hasConsistentStructure: boolean;
  
  /** Primary growth direction of the tree */
  primaryGrowthDirection: "down" | "right" | "up" | "left";
  
  /** Secondary growth direction (for indentation) */
  secondaryGrowthDirection: "down" | "right" | "up" | "left";
  
  /** Confidence in tree role detection (0-1) */
  confidence: number;
}

/**
 * Table-specific role analysis
 */
export interface TableRoleAnalysis {
  /** Cells identified as table headers */
  headerCells: RoleAssignment[];
  
  /** Cells identified as row headers */
  rowHeaderCells: RoleAssignment[];
  
  /** Cells identified as column headers */
  columnHeaderCells: RoleAssignment[];
  
  /** Cells identified as data cells */
  dataCells: RoleAssignment[];
  
  /** All cells that are part of the table */
  tableCells: RoleAssignment[];
  
  /** Table structure organized by rows */
  rowStructure: Map<number, RoleAssignment[]>;
  
  /** Table structure organized by columns */
  columnStructure: Map<number, RoleAssignment[]>;
  
  /** Header region bounds */
  headerRegion?: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  
  /** Data region bounds */
  dataRegion?: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  
  /** Number of header rows */
  headerRowCount: number;
  
  /** Number of header columns */
  headerColumnCount: number;
  
  /** Whether the table has consistent column types */
  hasConsistentColumnTypes: boolean;
  
  /** Data types by column */
  columnDataTypes: Map<number, string>;
  
  /** Confidence in table role detection (0-1) */
  confidence: number;
}

/**
 * Matrix-specific role analysis
 */
export interface MatrixRoleAnalysis {
  /** Cell identified as the matrix corner (usually empty) */
  cornerCell?: RoleAssignment;
  
  /** Cells identified as primary headers (row or column labels) */
  primaryHeaderCells: RoleAssignment[];
  
  /** Cells identified as secondary headers (column or row labels) */
  secondaryHeaderCells: RoleAssignment[];
  
  /** Cells identified as matrix body (intersection data) */
  bodyCells: RoleAssignment[];
  
  /** All cells that are part of the matrix */
  matrixCells: RoleAssignment[];
  
  /** Primary header direction ("row" or "column") */
  primaryHeaderDirection: "row" | "column";
  
  /** Secondary header direction ("row" or "column") */
  secondaryHeaderDirection: "row" | "column";
  
  /** Matrix dimensions */
  dimensions: {
    primaryHeaderCount: number;
    secondaryHeaderCount: number;
    bodyRowCount: number;
    bodyColumnCount: number;
  };
  
  /** Header regions */
  headerRegions: {
    primary: {
      topRow: number;
      bottomRow: number;
      leftCol: number;
      rightCol: number;
    };
    secondary: {
      topRow: number;
      bottomRow: number;
      leftCol: number;
      rightCol: number;
    };
  };
  
  /** Body region */
  bodyRegion: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  
  /** Confidence in matrix role detection (0-1) */
  confidence: number;
}

/**
 * Key-Value specific role analysis
 */
export interface KeyValueRoleAnalysis {
  /** Individual key-value pairs detected */
  keyValuePairs: Array<{
    key: RoleAssignment;
    values: RoleAssignment[];
    level: number;
    parentKey?: CellPosition;
  }>;
  
  /** All cells identified as keys */
  keyCells: RoleAssignment[];
  
  /** All cells identified as values */
  valueCells: RoleAssignment[];
  
  /** All cells that are part of key-value pairs */
  keyValueCells: RoleAssignment[];
  
  /** Hierarchical organization of key-value pairs */
  hierarchy: Map<number, Array<{
    key: RoleAssignment;
    values: RoleAssignment[];
  }>>;
  
  /** Whether key-value pairs are nested within other constructs */
  isNested: boolean;
  
  /** Parent construct if nested */
  parentConstruct?: "tree" | "table" | "matrix";
  
  /** Maximum nesting level */
  maxNestingLevel: number;
  
  /** Primary direction for key-value layout */
  primaryDirection: "horizontal" | "vertical";
  
  /** Confidence in key-value role detection (0-1) */
  confidence: number;
}

/**
 * Complete cell role traits for a cell cluster
 */
export interface CellRoleTraits {
  /** Tree-specific role analysis */
  tree: TreeRoleAnalysis;
  
  /** Table-specific role analysis */
  table: TableRoleAnalysis;
  
  /** Matrix-specific role analysis */
  matrix: MatrixRoleAnalysis;
  
  /** Key-Value specific role analysis */
  keyValue: KeyValueRoleAnalysis;
  
  /** All role assignments for all cells */
  allRoleAssignments: Map<string, RoleAssignment>; // position key -> role assignment
  
  /** Primary construct type suggested by role analysis */
  primaryConstructType: "tree" | "table" | "matrix" | "key-value" | "mixed" | "unknown";
  
  /** Secondary construct types that might also apply */
  secondaryConstructTypes: string[];
  
  /** Overall confidence in role assignments (0-1) */
  overallConfidence: number;
  
  /** Whether roles form a coherent structure */
  hasCoherentStructure: boolean;
  
  /** Whether multiple construct types are present */
  hasMultipleConstructs: boolean;
  
  /** Construct type confidence scores */
  constructConfidenceScores: Map<string, number>;
}