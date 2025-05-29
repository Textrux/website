import {
  Orientation,
  Direction,
  RootCellPosition,
  DynamicCorePattern,
} from "../cell-cluster/CellClusterTraits";
import { BlockType, BlockShape } from "../block/BlockTraits";

// BlockCluster-specific enums
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
  Sequential = "sequential",
  Parallel = "parallel",
  Hierarchical = "hierarchical",
  Mesh = "mesh",
  Hub = "hub",
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

// Main trait categories for BlockCluster
export interface BlockClusterBaseTraits {
  // Size and geometry
  blockCount: number;
  totalArea: number;
  averageBlockSize: number;
  clusterDensity: number; // how tightly packed the blocks are

  // Spatial distribution
  clusterWidth: number;
  clusterHeight: number;
  clusterAspectRatio: number;

  // Block arrangement
  blocksInRow: number;
  blocksInColumn: number;
  hasRegularSpacing: boolean;
  hasAlignment: boolean;

  // Connectivity
  joinCount: number;
  linkedPointCount: number;
  lockedPointCount: number;
  connectivityRatio: number; // (linked + locked) / total possible connections
}

export interface BlockClusterCompositeTraits {
  // Block relationships
  hasHierarchy: boolean;
  hasSequencing: boolean;
  hasBranching: boolean;
  hasSymmetry: boolean;

  // Content coherence
  hasUniformBlockTypes: boolean;
  hasComplementaryBlocks: boolean;
  hasMixedPurposes: boolean;

  // Structural patterns
  isGrid: boolean;
  isTree: boolean;
  isList: boolean;
  isNetwork: boolean;
  isFlow: boolean;

  // Directional flow
  hasDirectionalFlow: boolean;
  flowDirection: "horizontal" | "vertical" | "radial" | "mixed" | "none";

  // Organization principles
  organizationBy: "position" | "content" | "function" | "hierarchy" | "mixed";
  groupingStrength: number; // 0-1 how strongly grouped the blocks appear
}

export interface BlockClusterDerivedTraits {
  // Construct identification
  likelyConstructs: string[]; // ['spreadsheet', 'dashboard', 'form', 'report', etc.]
  confidence: number;

  // Functional classification
  isDataStructure: boolean;
  isUserInterface: boolean;
  isDocument: boolean;
  isVisualization: boolean;
  isNavigation: boolean;

  // Purpose inference
  primaryPurpose:
    | "data-display"
    | "data-entry"
    | "calculation"
    | "navigation"
    | "decoration"
    | "mixed";
  complexity: "simple" | "moderate" | "complex" | "very-complex";

  // User interaction hints
  isInteractive: boolean;
  isReadOnly: boolean;
  requiresNavigation: boolean;

  // Layout characteristics
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
