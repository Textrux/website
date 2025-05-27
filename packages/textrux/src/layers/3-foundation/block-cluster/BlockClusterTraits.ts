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
  dimensions: BlockClusterDimensionTraits;
  connections: BlockClusterConnectionTraits;
  topology: BlockClusterTopologyTraits;
  distribution: BlockClusterDistributionTraits;
}

export interface BlockClusterCompositeTraits {
  isWellConnected: boolean;
  hasBalancedStructure: boolean;
  structuralStability: number; // 0-1 score
  visualCohesion: number; // 0-1 score of how unified the cluster appears
  functionalIntegrity: number; // 0-1 score of how well the cluster serves its purpose
  scalabilityScore: number; // 0-1 score of how well the cluster could grow
}

export interface BlockClusterDerivedTraits {
  primaryPurpose: string; // e.g., "layout", "navigation", "content", "decoration"
  dominantFlow: Direction;
  clusterRole: string; // e.g., "header", "sidebar", "main", "footer"
  interactionPattern: string; // e.g., "sequential", "selective", "hierarchical"
  visualHierarchy: number; // 0-1 score of how clear the hierarchy is
}

// Main BlockClusterTraits interface
export interface BlockClusterTraits {
  base: BlockClusterBaseTraits;
  composite: BlockClusterCompositeTraits;
  derived: BlockClusterDerivedTraits;
}
