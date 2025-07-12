/**
 * Arrangement traits for analyzing spatial organization and orientation
 * of cell clusters
 */

import { CellPosition, Direction } from "./SpatialRelationshipTraits";

export enum OrientationType {
  Vertical = "vertical",
  Horizontal = "horizontal", 
  Radial = "radial",
  Diagonal = "diagonal",
  Mixed = "mixed",
  None = "none",
}

export enum SpacingType {
  Regular = "regular",
  Irregular = "irregular",
  Hierarchical = "hierarchical",
  Compact = "compact",
  Sparse = "sparse",
  None = "none",
}

export enum BoundaryType {
  Rectangular = "rectangular",
  Stepped = "stepped",
  Irregular = "irregular",
  Linear = "linear",
  Radial = "radial",
  None = "none",
}

export enum FlowDirection {
  TopToBottom = "top-to-bottom",
  BottomToTop = "bottom-to-top",
  LeftToRight = "left-to-right",
  RightToLeft = "right-to-left",
  Radial = "radial",
  Mixed = "mixed",
  None = "none",
}

/**
 * Analysis of spatial orientation patterns
 */
export interface OrientationAnalysis {
  /** Whether the arrangement is primarily vertical */
  isVertical: boolean;
  
  /** Whether the arrangement is primarily horizontal */
  isHorizontal: boolean;
  
  /** Whether the arrangement is radial (from center) */
  isRadial: boolean;
  
  /** Whether the arrangement is diagonal */
  isDiagonal: boolean;
  
  /** Primary orientation type */
  primaryOrientation: OrientationType;
  
  /** Secondary orientation type (if mixed) */
  secondaryOrientation?: OrientationType;
  
  /** Primary direction of arrangement */
  primaryDirection: Direction;
  
  /** Secondary direction of arrangement */
  secondaryDirection: Direction;
  
  /** Confidence in orientation detection (0-1) */
  orientationConfidence: number;
  
  /** Whether orientation is consistent throughout */
  hasConsistentOrientation: boolean;
  
  /** Angle of primary axis (for diagonal arrangements) */
  primaryAxisAngle?: number;
  
  /** Cells that define the primary axis */
  primaryAxisCells: CellPosition[];
  
  /** Cells that define the secondary axis */
  secondaryAxisCells: CellPosition[];
}

/**
 * Analysis of spacing and distribution patterns
 */
export interface SpacingAnalysis {
  /** Whether row spacing is consistent */
  hasConsistentRowSpacing: boolean;
  
  /** Whether column spacing is consistent */
  hasConsistentColumnSpacing: boolean;
  
  /** Whether spacing varies systematically (hierarchical) */
  hasHierarchicalSpacing: boolean;
  
  /** Whether spacing appears random/irregular */
  hasIrregularSpacing: boolean;
  
  /** Whether arrangement is compact (minimal spacing) */
  isCompact: boolean;
  
  /** Whether arrangement is sparse (wide spacing) */
  isSparse: boolean;
  
  /** Primary spacing type detected */
  primarySpacingType: SpacingType;
  
  /** Average spacing between rows */
  averageRowSpacing: number;
  
  /** Average spacing between columns */
  averageColumnSpacing: number;
  
  /** Standard deviation of row spacing */
  rowSpacingVariation: number;
  
  /** Standard deviation of column spacing */
  columnSpacingVariation: number;
  
  /** Spacing pattern by row */
  rowSpacingPattern: number[];
  
  /** Spacing pattern by column */
  columnSpacingPattern: number[];
  
  /** Whether spacing suggests specific construct types */
  spacingSuggestsConstruct: string[];
  
  /** Confidence in spacing analysis (0-1) */
  spacingConfidence: number;
}

/**
 * Analysis of boundary and edge patterns
 */
export interface BoundaryAnalysis {
  /** Whether the cluster has a regular rectangular boundary */
  hasRegularBoundary: boolean;
  
  /** Whether the left edge is aligned */
  hasAlignedLeftEdge: boolean;
  
  /** Whether the right edge is aligned */
  hasAlignedRightEdge: boolean;
  
  /** Whether the top edge is aligned */
  hasAlignedTopEdge: boolean;
  
  /** Whether the bottom edge is aligned */
  hasAlignedBottomEdge: boolean;
  
  /** Whether the boundary has a stepped pattern */
  hasSteppedBoundary: boolean;
  
  /** Whether the boundary is completely irregular */
  hasIrregularBoundary: boolean;
  
  /** Primary boundary type */
  primaryBoundaryType: BoundaryType;
  
  /** Boundary points (outline of the cluster) */
  boundaryPoints: CellPosition[];
  
  /** Whether boundary suggests specific construct types */
  boundarySuggestsConstruct: string[];
  
  /** Convexity of the boundary (0 = concave, 1 = convex) */
  boundaryConvexity: number;
  
  /** Aspect ratio of bounding rectangle */
  boundingRectangleAspectRatio: number;
  
  /** Fill ratio within bounding rectangle */
  boundingRectangleFillRatio: number;
  
  /** Confidence in boundary analysis (0-1) */
  boundaryConfidence: number;
}

/**
 * Analysis of flow and reading patterns
 */
export interface FlowAnalysis {
  /** Primary direction of information flow */
  primaryFlowDirection: FlowDirection;
  
  /** Secondary direction of information flow */
  secondaryFlowDirection?: FlowDirection;
  
  /** Whether flow follows a linear pattern */
  hasLinearFlow: boolean;
  
  /** Whether flow follows a hierarchical pattern */
  hasHierarchicalFlow: boolean;
  
  /** Whether flow follows a tabular pattern */
  hasTabularFlow: boolean;
  
  /** Whether flow follows a radial pattern */
  hasRadialFlow: boolean;
  
  /** Starting points for flow */
  flowStartPoints: CellPosition[];
  
  /** Ending points for flow */
  flowEndPoints: CellPosition[];
  
  /** Flow paths through the cluster */
  flowPaths: CellPosition[][];
  
  /** Whether flow suggests reading order */
  suggestsReadingOrder: boolean;
  
  /** Suggested reading sequence */
  readingSequence?: CellPosition[];
  
  /** Confidence in flow analysis (0-1) */
  flowConfidence: number;
}

/**
 * Analysis of symmetry and balance
 */
export interface SymmetryAnalysis {
  /** Whether the arrangement has left-right symmetry */
  hasLeftRightSymmetry: boolean;
  
  /** Whether the arrangement has top-bottom symmetry */
  hasTopBottomSymmetry: boolean;
  
  /** Whether the arrangement has rotational symmetry */
  hasRotationalSymmetry: boolean;
  
  /** Whether the arrangement has diagonal symmetry */
  hasDiagonalSymmetry: boolean;
  
  /** Center point of symmetry (if any) */
  symmetryCenter?: CellPosition;
  
  /** Axis of symmetry (if any) */
  symmetryAxis?: {
    start: CellPosition;
    end: CellPosition;
  };
  
  /** Whether the arrangement is balanced */
  isBalanced: boolean;
  
  /** Center of mass of the arrangement */
  centerOfMass: {
    row: number;
    col: number;
  };
  
  /** Confidence in symmetry analysis (0-1) */
  symmetryConfidence: number;
}

/**
 * Analysis of grid alignment and positioning
 */
export interface GridAlignmentAnalysis {
  /** Whether the cluster aligns with grid structure */
  alignsWithGridStructure: boolean;
  
  /** Whether rows align with grid rows */
  rowsAlignWithGrid: boolean;
  
  /** Whether columns align with grid columns */
  columnsAlignWithGrid: boolean;
  
  /** Starting grid position */
  gridStartPosition: CellPosition;
  
  /** Ending grid position */
  gridEndPosition: CellPosition;
  
  /** Whether cluster spans multiple grid regions */
  spansMultipleRegions: boolean;
  
  /** Whether cluster bridges gaps in grid */
  bridgesGridGaps: boolean;
  
  /** Grid utilization efficiency (0-1) */
  gridUtilizationEfficiency: number;
  
  /** Whether positioning suggests intentional layout */
  suggestsIntentionalLayout: boolean;
  
  /** Confidence in grid alignment analysis (0-1) */
  gridAlignmentConfidence: number;
}

/**
 * Complete arrangement traits for a cell cluster
 */
export interface ArrangementTraits {
  /** Analysis of spatial orientation patterns */
  orientation: OrientationAnalysis;
  
  /** Analysis of spacing and distribution patterns */
  spacing: SpacingAnalysis;
  
  /** Analysis of boundary and edge patterns */
  boundaries: BoundaryAnalysis;
  
  /** Analysis of flow and reading patterns */
  flow: FlowAnalysis;
  
  /** Analysis of symmetry and balance */
  symmetry: SymmetryAnalysis;
  
  /** Analysis of grid alignment and positioning */
  gridAlignment: GridAlignmentAnalysis;
  
  /** Overall spatial organization score (0-1) */
  spatialOrganization: number;
  
  /** Whether the arrangement shows intentional design */
  showsIntentionalDesign: boolean;
  
  /** Primary arrangement pattern detected */
  primaryArrangementPattern: "linear" | "tabular" | "hierarchical" | "radial" | "scattered" | "mixed";
  
  /** Secondary arrangement patterns */
  secondaryArrangementPatterns: string[];
  
  /** Construct types suggested by arrangement */
  arrangementSuggestsConstruct: string[];
  
  /** Overall confidence in arrangement analysis (0-1) */
  arrangementConfidence: number;
  
  /** Whether arrangement is suitable for specific interactions */
  interactionSuitability: Map<string, number>; // interaction type -> suitability score
}