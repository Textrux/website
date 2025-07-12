/**
 * Spatial relationship traits for detailed analysis of cell clusters
 * These traits focus on the spatial arrangement and connectivity patterns
 * needed for construct detection
 */

export interface CellPosition {
  row: number;
  col: number;
}

export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export enum GrowthPattern {
  Expanding = "expanding",     // Growth in multiple directions
  Linear = "linear",          // Growth in one primary direction
  Radial = "radial",          // Growth from a central point
  Compact = "compact",        // Dense, contained growth
  Scattered = "scattered",    // Disconnected growth pattern
}

export enum ConnectivityPattern {
  Tree = "tree",              // Hierarchical parent-child relationships
  Grid = "grid",              // Regular matrix-like connections
  Linear = "linear",          // Sequential chain connections
  Scattered = "scattered",    // Few or no clear connections
  Star = "star",              // Central hub with branches
}

/**
 * Analysis of corner cells in the cluster
 */
export interface CornerAnalysis {
  topLeft: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  topRight: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  bottomLeft: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  bottomRight: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  
  /** Number of corners that are filled */
  filledCornerCount: number;
  
  /** Number of corners that are explicitly empty */
  emptyCornerCount: number;
  
  /** Primary corner that seems to be the origin */
  primaryCorner?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

/**
 * Analysis of edge patterns in the cluster
 */
export interface EdgeAnalysis {
  top: {
    fillPattern: string;        // Pattern like "1101" representing filled cells
    density: number;           // Ratio of filled to total edge cells
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  bottom: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  left: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  right: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  
  /** Which edges are completely filled */
  fullyFilledEdges: Array<"top" | "bottom" | "left" | "right">;
  
  /** Which edges have regular patterns */
  regularEdges: Array<"top" | "bottom" | "left" | "right">;
}

/**
 * Analysis of cell connectivity and relationships
 */
export interface ConnectivityAnalysis {
  /** Whether cells show parent-child relationships */
  hasParentChildRelationships: boolean;
  
  /** Whether cells show peer relationships (same level) */
  hasPeerRelationships: boolean;
  
  /** Maximum hierarchical depth detected */
  maxDepth: number;
  
  /** Average number of children per parent */
  branchingFactor: number;
  
  /** Overall connectivity pattern */
  connectivityPattern: ConnectivityPattern;
  
  /** Potential root cells (corners or prominent positions) */
  potentialRootCells: CellPosition[];
  
  /** Cells that appear to be parents (have dependent cells) */
  potentialParentCells: CellPosition[];
  
  /** Cells that appear to be children (dependent on other cells) */
  potentialChildCells: CellPosition[];
  
  /** Groups of cells at the same hierarchical level */
  peerGroups: CellPosition[][];
}

/**
 * Analysis of growth direction and patterns
 */
export interface GrowthAnalysis {
  /** Primary direction of growth */
  primaryDirection: Direction;
  
  /** Secondary direction of growth */
  secondaryDirection: Direction;
  
  /** Overall growth pattern */
  growthPattern: GrowthPattern;
  
  /** Confidence in the detected primary direction (0-1) */
  primaryDirectionConfidence: number;
  
  /** Whether growth is consistent across the cluster */
  hasConsistentGrowth: boolean;
  
  /** Starting point(s) for growth */
  growthOrigins: CellPosition[];
  
  /** Ending point(s) for growth */
  growthTerminals: CellPosition[];
}

/**
 * Analysis of indentation and offset patterns
 */
export interface IndentationAnalysis {
  /** Whether there are consistent indentation levels */
  hasConsistentIndentation: boolean;
  
  /** Number of distinct indentation levels */
  indentationLevels: number;
  
  /** Maximum indentation detected */
  maxIndentation: number;
  
  /** Primary direction for indentation measurement */
  indentationDirection: Direction;
  
  /** Cells grouped by indentation level */
  cellsByIndentationLevel: Map<number, CellPosition[]>;
  
  /** Whether indentation follows a tree pattern */
  followsTreePattern: boolean;
  
  /** Whether indentation follows a list pattern */
  followsListPattern: boolean;
}

/**
 * Complete spatial relationship traits for a cell cluster
 */
export interface SpatialRelationshipTraits {
  /** Analysis of corner positions and patterns */
  corners: CornerAnalysis;
  
  /** Analysis of edge patterns and density */
  edges: EdgeAnalysis;
  
  /** Analysis of cell connectivity and relationships */
  connectivity: ConnectivityAnalysis;
  
  /** Analysis of growth direction and patterns */
  growth: GrowthAnalysis;
  
  /** Analysis of indentation and offset patterns */
  indentation: IndentationAnalysis;
  
  /** Overall spatial coherence score (0-1) */
  spatialCoherence: number;
  
  /** Whether the cluster shows structural organization */
  hasStructuralOrganization: boolean;
  
  /** Dominant spatial pattern detected */
  dominantPattern: "tree" | "table" | "matrix" | "list" | "scattered" | "mixed";
  
  /** Confidence in the spatial analysis (0-1) */
  analysisConfidence: number;
}