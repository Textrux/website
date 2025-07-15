// import {
//   Orientation,
//   Direction,
//   RootCellPosition,
//   DynamicCorePattern,
// } from "../cell-cluster/CellClusterTraits"; // Legacy trait system removed

// Temporary type definitions for legacy compatibility
export enum Orientation { Primary = "primary", Secondary = "secondary" }
export enum Direction { Down = "down", Right = "right", Up = "up", Left = "left" }
export enum RootCellPosition { TopLeft = "topleft", TopRight = "topright", BottomLeft = "bottomleft", BottomRight = "bottomright" }
export enum DynamicCorePattern { Tree = "tree", Table = "table", Matrix = "matrix", KeyValue = "keyvalue" }
import { BlockType, BlockShape } from "../block/BlockTraits";

// BlockCluster-specific enums (now for groups of BlockSubclusters)
export enum ClusterTopology {
  Linear = "linear",
  Grid = "grid",
  Tree = "tree",
  Star = "star",
  Ring = "ring",
  Complex = "complex",
}

export enum ClusterDensity {
  Sparse = "sparse",
  Medium = "medium",
  Dense = "dense",
  Packed = "packed",
}

export enum ConnectionPattern {
  Proximity = "proximity", // Close together spatially
  Sequential = "sequential", // In sequence
  Parallel = "parallel", // Side by side
  Hierarchical = "hierarchical", // Nested arrangement
  Grid = "grid", // Grid arrangement
  Scattered = "scattered", // Random distribution
}

// Base trait interfaces for BlockCluster
export interface BlockClusterDimensionTraits {
  blockCount: number;
  totalWidth: number;
  totalHeight: number;
  totalCellCount: number;
  averageBlockSize: number;
  largestBlockSize: number;
  smallestBlockSize: number;
  blockSizeVariance: number;
  clusterDensity: ClusterDensity;
  boundingBoxUtilization: number; // percentage of bounding box filled
}

export interface BlockClusterConnectionTraits {
  joinCount: number;
  linkedJoinCount: number;
  lockedJoinCount: number;
  averageConnectionsPerBlock: number;
  maxConnectionsPerBlock: number;
  connectionPattern: ConnectionPattern;
  hasIsolatedBlocks: boolean;
  connectionDensity: number; // 0-1 score
}

export interface BlockClusterTopologyTraits {
  topology: ClusterTopology;
  hasMainPath: boolean;
  pathLength: number;
  branchCount: number;
  cycleCount: number;
  hierarchyDepth: number;
  centralityScore: number; // how centralized the structure is
}

export interface BlockClusterDistributionTraits {
  blockTypeDistribution: Record<BlockType, number>;
  spatialDistribution: string; // e.g., "uniform", "clustered", "edge-heavy"
  orientationConsistency: number; // 0-1 score of how consistent block orientations are
  alignmentScore: number; // 0-1 score of how well blocks align
}

// Main trait categories for BlockCluster (groups of BlockSubclusters)
export interface BlockClusterBaseTraits {
  // Size and geometry
  subclusterCount: number;
  totalArea: number;
  averageSubclusterSize: number;
  clusterDensity: number; // how tightly packed the subclusters are

  // Spatial distribution
  clusterWidth: number;
  clusterHeight: number;
  clusterAspectRatio: number;

  // Subcluster arrangement
  subclustersInRow: number;
  subclustersInColumn: number;
  hasRegularSpacing: boolean;
  hasAlignment: boolean;

  // Coverage
  canvasArea: number;
  perimeterArea: number;
  bufferArea: number;
  utilizationRatio: number; // occupied area / total area
}

export interface BlockClusterCompositeTraits {
  // Subcluster relationships
  hasHierarchy: boolean;
  hasSequencing: boolean;
  hasSymmetry: boolean;
  hasOverlap: boolean;

  // Spatial patterns
  isGrid: boolean;
  isLinear: boolean;
  isScattered: boolean;
  isNested: boolean;

  // Organization principles
  organizationPattern: ConnectionPattern;
  groupingStrength: number; // 0-1 how strongly grouped the subclusters appear
  spatialCoherence: number; // 0-1 how coherent the spatial arrangement is

  // Directional characteristics
  hasDirectionalFlow: boolean;
  flowDirection: "horizontal" | "vertical" | "radial" | "mixed" | "none";
  primaryOrientation:
    | "horizontal"
    | "vertical"
    | "diagonal"
    | "radial"
    | "none";
}

export interface BlockClusterDerivedTraits {
  // Construct identification
  likelyConstructs: string[]; // ['layout', 'dashboard', 'workspace', 'document', etc.]
  confidence: number;

  // Functional classification
  isLayoutStructure: boolean;
  isContentStructure: boolean;
  isNavigationStructure: boolean;
  isDecorativeStructure: boolean;

  // Purpose inference
  primaryPurpose:
    | "layout-organization"
    | "content-grouping"
    | "spatial-division"
    | "visual-structure"
    | "functional-grouping"
    | "mixed";
  complexity: "simple" | "moderate" | "complex" | "very-complex";

  // Structural characteristics
  structuralRole:
    | "container"
    | "organizer"
    | "separator"
    | "coordinator"
    | "composite";
  layoutStyle: "formal" | "informal" | "structured" | "organic";
  visualBalance: number; // 0-1 how well balanced the layout appears

  // Evolution potential
  isExtensible: boolean;
  growthDirection: "horizontal" | "vertical" | "both" | "none";
  stabilityScore: number; // 0-1 how stable/complete the structure appears
}

// Main BlockClusterTraits interface
export interface BlockClusterTraits {
  base: BlockClusterBaseTraits;
  composite: BlockClusterCompositeTraits;
  derived: BlockClusterDerivedTraits;
}
