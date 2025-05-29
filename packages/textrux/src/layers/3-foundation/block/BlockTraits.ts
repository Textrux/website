/**
 * BlockTraits - Analysis of entire block containers
 * Focuses on geometric properties, spatial relationships, and overall block structure
 * Content analysis is handled at CellCluster and CellSubcluster levels
 */

import {
  Orientation,
  Direction,
  RootCellPosition,
  DynamicCorePattern,
} from "../cell-cluster/CellClusterTraits";

// Block-specific enums
export enum BlockType {
  Canvas = "canvas",
  Border = "border",
  Frame = "frame",
  Mixed = "mixed",
}

export enum BlockShape {
  Rectangle = "rectangle",
  Square = "square",
  Irregular = "irregular",
}

export enum BlockLayout {
  Single = "single", // One cell cluster
  Grid = "grid", // Regular grid of clusters
  Linear = "linear", // Clusters in a line
  Scattered = "scattered", // Randomly distributed clusters
  Hierarchical = "hierarchical", // Tree-like arrangement
  Radial = "radial", // Clusters around a center
}

// Base trait interfaces for Block
export interface BlockDimensionTraits {
  width: number;
  height: number;
  totalCellCount: number;
  canvasCellCount: number;
  borderCellCount: number;
  frameCellCount: number;
  canvasFilledCount: number;
  canvasEmptyCount: number;
  canvasPercentFilled: number;
}

export interface BlockBoundaryTraits {
  hasCompleteBorder: boolean;
  hasCompleteFrame: boolean;
  borderThickness: number;
  frameThickness: number;
  borderGaps: number;
  frameGaps: number;
}

export interface BlockCanvasTraits {
  canvasShape: BlockShape;
  canvasOrientation: Orientation;
  canvasAspectRatio: number;
  canvasContiguousRegions: number;
  canvasLargestContiguousRegionSize: number;
  canvasPerimeterFilled: boolean;
  canvasCenterFilled: boolean;
}

export interface BlockClusterTraits {
  cellClusterCount: number;
  largestCellClusterSize: number;
  averageCellClusterSize: number;
  cellClustersContiguous: boolean;
  cellClusterDistribution: string; // e.g., "uniform", "clustered", "scattered"
}

/**
 * Base traits for Block - fundamental geometric and spatial properties
 */
export interface BlockBaseTraits {
  // Overall geometry
  width: number;
  height: number;
  area: number; // total bounding box area
  aspectRatio: number;

  // Position in grid
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  centerRow: number;
  centerCol: number;

  // Canvas, border, frame analysis
  canvasCellCount: number; // filled cells
  borderCellCount: number; // border ring cells
  frameCellCount: number; // frame ring cells
  totalBoundingCellCount: number; // total area
  canvasFillDensity: number; // canvasCellCount / totalBoundingCellCount

  // Shape characteristics
  blockShape: BlockShape;
  isSquare: boolean;
  isRectangular: boolean;
  isLinear: boolean;
  isHorizontalLine: boolean;
  isVerticalLine: boolean;
  isSingleCell: boolean;

  // Boundary analysis
  hasDefinedBoundary: boolean;
  boundaryRegularity: number; // 0-1 how regular the boundary is
}

/**
 * Composite traits for Block - relationships and structural patterns
 */
export interface BlockCompositeTraits {
  // Cell cluster organization
  cellClusterCount: number;
  largestCellClusterSize: number;
  averageCellClusterSize: number;
  clusterSizeVariability: number; // 0-1 how much cluster sizes vary

  // Spatial arrangement of clusters
  clusterLayout: BlockLayout;
  clustersAreContiguous: boolean;
  clustersAreAligned: boolean;
  clusterSpacing: "tight" | "moderate" | "loose" | "mixed";

  // Block boundaries
  hasCompleteBorder: boolean;
  hasCompleteFrame: boolean;
  borderThickness: number;
  frameThickness: number;
  borderGaps: number;
  frameGaps: number;
  boundaryQuality: number; // 0-1 completeness of boundaries

  // Internal structure
  hasInternalStructure: boolean;
  structuralComplexity: number; // 0-1 based on cluster arrangement
  hasSymmetricLayout: boolean;
  hasRegularSpacing: boolean;

  // Connectivity patterns between clusters
  clustersAreConnected: boolean;
  connectionDensity: number; // 0-1 how well clusters connect
  hasHierarchicalRelations: boolean;
  hasLinearFlow: boolean;

  // Empty space utilization
  emptySpaceRatio: number; // empty cells / total area
  emptySpaceDistribution: "uniform" | "clustered" | "random" | "structured";
  hasSignificantWhitespace: boolean;
}

/**
 * Derived traits for Block - high-level block purpose and relationships
 */
export interface BlockDerivedTraits {
  // Structural role
  structuralRole:
    | "container" // Contains other elements
    | "wrapper" // Wraps around content
    | "separator" // Divides regions
    | "connector" // Links other blocks
    | "standalone" // Independent unit
    | "composite"; // Multiple purposes

  // Layout purpose
  layoutPurpose:
    | "grid-organizer" // Organizes in grid pattern
    | "list-container" // Contains sequential items
    | "tree-root" // Root of hierarchical structure
    | "workspace" // General work area
    | "frame-provider" // Provides visual frame
    | "content-block"; // Self-contained content

  // Block relationships
  isParentBlock: boolean; // Contains subordinate blocks
  isChildBlock: boolean; // Contained within larger structure
  isSiblingBlock: boolean; // Peer relationship with other blocks
  nestingLevel: number; // Depth in block hierarchy

  // Spatial relationships
  primaryOrientation: "horizontal" | "vertical" | "grid" | "radial" | "none";
  secondaryOrientation: "horizontal" | "vertical" | "grid" | "radial" | "none";
  spatialImportance: number; // 0-1 spatial prominence

  // Functional characteristics
  isStatic: boolean; // Doesn't change often
  isDynamic: boolean; // Changes frequently
  isExpandable: boolean; // Can grow in size
  isResizable: boolean; // Can be resized
  isMoveable: boolean; // Can be relocated

  // Construct indicators (high-level only)
  likelyBlockConstructs: string[]; // 'container', 'wrapper', 'organizer', etc.
  blockPurposeConfidence: number; // 0-1 confidence in purpose

  // Quality and maintenance
  structuralIntegrity: number; // 0-1 how well-formed the block is
  maintainabilityScore: number; // 0-1 ease of maintenance
  complexity: "simple" | "moderate" | "complex" | "very-complex";

  // Performance implications
  renderingComplexity: number; // 0-1 cost to render
  memoryFootprint: number; // 0-1 relative memory usage
  scalability: number; // 0-1 ability to handle growth
}

/**
 * Complete BlockTraits interface
 */
export interface BlockTraits {
  base: BlockBaseTraits;
  composite: BlockCompositeTraits;
  derived: BlockDerivedTraits;
}
