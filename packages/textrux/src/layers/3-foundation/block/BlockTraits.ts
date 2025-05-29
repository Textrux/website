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
 * Base traits are fundamental geometric and spatial properties
 */
export interface BlockBaseTraits {
  // Geometric properties
  width: number;
  height: number;
  area: number;
  aspectRatio: number;

  // Positional properties
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  centerRow: number;
  centerCol: number;

  // Density and fill properties
  canvasCellCount: number;
  totalBoundingCellCount: number;
  fillDensity: number; // canvasCellCount / totalBoundingCellCount

  // Shape characteristics
  isSquare: boolean;
  isRectangular: boolean;
  isLinear: boolean; // width=1 or height=1
  isHorizontalLine: boolean;
  isVerticalLine: boolean;
  isSingleCell: boolean;
}

/**
 * Composite traits are derived from relationships and content analysis
 */
export interface BlockCompositeTraits {
  // Content patterns
  hasUniformContent: boolean;
  hasNumericContent: boolean;
  hasTextContent: boolean;
  hasFormulas: boolean;
  hasMixedContent: boolean;

  // Structural patterns
  hasHeaders: boolean;
  hasFooters: boolean;
  hasBorders: boolean;
  hasPattern: boolean;

  // Alignment and organization
  contentAlignment: "left" | "right" | "center" | "mixed" | "none";
  hasColumnStructure: boolean;
  hasRowStructure: boolean;

  // Data characteristics
  dataTypes: string[]; // ['number', 'text', 'date', 'formula', etc.]
  dominantDataType: string;

  // Empty space analysis
  hasSignificantWhitespace: boolean;
  emptyToFilledRatio: number;
}

/**
 * Derived traits are high-level interpretations and potential construct indicators
 */
export interface BlockDerivedTraits {
  // Potential construct signatures
  likelyConstructs: string[]; // ['table', 'tree', 'list', 'header', etc.]
  confidence: number; // 0-1 confidence in primary construct identification

  // Behavioral hints
  isContainer: boolean;
  isLeaf: boolean;
  isHeader: boolean;
  isFooter: boolean;
  isData: boolean;
  isNavigation: boolean;

  // Directional orientation
  primaryDirection: "horizontal" | "vertical" | "radial" | "none";
  secondaryDirection: "horizontal" | "vertical" | "radial" | "none";

  // Relationship indicators
  isParent: boolean;
  isChild: boolean;
  isSibling: boolean;
  nestingLevel: number;

  // Content semantics
  semanticRole: string; // 'title', 'data', 'summary', 'navigation', etc.
  importance: number; // 0-1 relative importance score
}

// Main BlockTraits interface
export interface BlockTraits {
  base: BlockBaseTraits;
  composite: BlockCompositeTraits;
  derived: BlockDerivedTraits;
}
