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

// Main trait categories for Block
export interface BlockBaseTraits {
  blockType: BlockType;
  dimensions: BlockDimensionTraits;
  boundary: BlockBoundaryTraits;
  canvas: BlockCanvasTraits;
  cellClusters: BlockClusterTraits;
}

export interface BlockCompositeTraits {
  isWellFormed: boolean;
  hasSymmetricBoundary: boolean;
  canvasToFrameRatio: number;
  boundaryIntegrity: number; // 0-1 score of how complete the boundary is
  canvasUtilization: number; // 0-1 score of how well the canvas space is used
  structuralBalance: number; // 0-1 score of overall structural balance
}

export interface BlockDerivedTraits {
  primaryFunction: string; // e.g., "container", "separator", "decorator"
  visualWeight: number; // 0-1 score of visual prominence
  dominantDirection: Direction;
  anchorPoint: RootCellPosition;
  growthPattern: DynamicCorePattern;
}

// Main BlockTraits interface
export interface BlockTraits {
  base: BlockBaseTraits;
  composite: BlockCompositeTraits;
  derived: BlockDerivedTraits;
}
